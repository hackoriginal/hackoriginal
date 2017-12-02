//
// Openbanking
//

let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

let path = require('path');
let request = require('superagent');

//
// Configurations
//

const port = 6001;
const url = `http://localhost:${port}/`;



let api_url = 'https://sandbox.original.com.br';
let auth_url = 'https://sb-autenticacao-api.original.com.br';
let auth_callback_url = `http://localhost:${port}/callback`
let developer_key = '28f955c90b3a2940134ff1a970050f569a87facf';
let secret_key = 'dd385cd0b59c013560400050569a7fac';
let access_token = '';

//
// Resources
//

let amount = '10.00';
let account_number = '222222';
let comments = 'Transferência';
let favored_id = '2';

let resources = {
    balance: {
        method: 'get',
        path: '/accounts/v1/balance'
    },
    balance_history: {
        method: 'get',
        path: '/accounts/v1/balance-history?date_from=20170623'
    },
    history: {
        method: 'get',
        path: '/accounts/v1/transaction-history'
    },
    favored_accounts: {
        method: 'get',
        path: '/payments/v1/money-transfer/favored-accounts'
    },
    tef: {
        title: 'Confirme a transferência de R$ 10,00',
        method: 'post',
        path: '/payments/v2/money-transfer/between-accounts',
        data: {
            amount,
            comments,
            callback_url: 'http://localhost:3001/',
            favored_id,
            // account_numbers
        }
    },
    tef_confirm: {
        title: 'Transferência executada com sucesso.',
        method: 'put',
        path: '/payments/v2/money-transfer/between-accounts',
        headers: {
            security_response: ''
        },
        data: {
            amount,
            comments,
            callback_url: `${url}`,
            favored_id,
            // account_number
        }
    },
    saldoPontos: {
        title: 'Saldo pontos',
        method: 'get',
        path: '/rewards/v1/balance',
        headers: {
            security_response: ''
        }
    },
    extratoPontos: {
        title: 'Extrato pontos',
        method: 'get',
        path: '/rewards/v1/transaction-history',
        headers: {
            security_response: ''
        }
    }
};

let show = (...messages) => {
    io.emit('message', messages.map(message => JSON.stringify(message, null, 4)));
    console.log(messages);
};

let execute_api = function (name) {
    let resource = resources[name];
    let action =
        request
        [resource.method](`${api_url}${resource.path}`)
            .set('developer-key', developer_key)
            .set('Authorization', access_token);

    if ('headers' in resource)
        for (let key in resource.headers)
            action.set(key, resource.headers[key]);

    if ('data' in resource)
        action.send(resource.data);

    return action;
    action
};

//
// Rotas Ui
//

app.get('/', (req, res) => {
    res.sendFile(path.join(`${__dirname + "/app/../ui"}/index.html`));
});
app.get('/app.js', (req, res) => {
    res.sendFile(path.join(`${__dirname + "/app/../ui"}/app.js`));
});
app.get('/css.css', (req, res) => {
    res.sendFile(path.join(`${__dirname + "/app/../ui"}/css.css`));
});

//
// OAuth
//
app.get('/oauth', (req, res) => {
    let url = `${auth_url}/OriginalConnect?scopes=account&callback_url=${auth_callback_url}&callback_id=1&developer_key=${developer_key}`;
    res.redirect(url);
});

// Access_token generation

app.get('/callback', (req, res) => {

    request
        .post(`${auth_url}/OriginalConnect/AccessTokenController`)
        .set('Content-Type', 'application/json')
        .send({
            auth_code: req.query.auth_code,
            uid: req.query.uid,
            developer_key,
            secret_key
        })
        .end((err, response) => {
            if (err) {
                res.send('<script>window.close();</script>');
                io.emit('authFalha', "autenticado com sucesso");
            }
            access_token = response.body.access_token;
            io.emit('authSucess', "autenticado com sucesso");
            res.send('<script>window.close();</script>');
        });
});

app.get('/testeapi', (req, res) => {
    res.send("api OK");
})

io.on('connection', socket => {
    socket.on('operation', operation => {
        execute_api(operation).end((err, res) => {
            if (err) {
                console.log(err);
            }
            else {
                if ('security_message' in res.body) {
                    resources.tef_confirm.headers.security_response = res.body.security_message;
                }
            }
        });
    });

    socket.on('exec', text => {
        let res = null;
        try {
            res = eval(text);
        } catch (e) {
            res = `${e.message}`;
        }
        if (res) {
            show(res);
        }
    });

    socket.on('dados', text => {
        console.log(text);
        switch (text) {
            case 'saldoPontos':
                execute_api('saldoPontos').end((err, res) => {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        if ('security_message' in res.body) {
                            resources.tef_confirm.headers.security_response = res.body.security_message;
                        }
                        io.emit('saldoPontosSucess', res.body.current_balance);
                    }
                });
                break;

            default:
                break;
        }
    })

});

http.listen(port, () => {
    console.log('OpenBanking Debugger');
    console.log(`${url}`);
});
