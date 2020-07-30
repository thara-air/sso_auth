const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')

const TWO_MINUTE = 1000 * 60 * 2;

const {
    PORT = 3000,
    SESS_LIFETIME = TWO_MINUTE,
    NODE_ENV = 'development',
    SESS_NAME = 'sid',
    SESS_SECRET = 'ssh!quiet,it\'asecret!',

} = process.env

const IN_PROD = NODE_ENV === 'production'

//TODO DB
const users = [
    { id: 1, name: 'Gihan', email: 'gthara.air@gmail.com', password: 'secret' },
    { id: 2, name: 'tharaka', email: 'thara.air@gmail.com', password: 'secret' }
]

const app = express()
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
        maxAge: SESS_LIFETIME,
        sameSite: true,
        secure: IN_PROD
    }
}))


const redirectLogin = (req, res, next) => {
    if(!req.session.userId){
        res.redirect('/login')
    } else{
        next()
    }
}

const redirectHome = (req, res, next ) => {
    if(req.session.userId) {
        res.redirect('/home')
    }else{
        next()
    }
}

app.use((req, res, next )=>{
    const {userId} = req.session
    if(userId){
        res.locals.user = users.find(
            user => user.id === userId
        )

    }
    next()
})

app.get('/', (req, res) => {
   // const userId = 1
     const { userId }  = req.session
    console.log(userId)
    res.send(`
<h1>welcome!</h1>
${userId ? `
<a href = '/home'>HOME</a>
<form method ='post' action = '/logout'>
<button>Logout</button>
</form>
`: `
<a href = '/login'>LOGIN </a>
<a href = '/register'>Register</a>

`}


   `)
})


app.get('/home', (req, res) => {
   const { user } = res.locals
   console.log(req.sessionID)
   // const user = users.find(user => user.id === req.session.userId)

    res.send(`
    <h1>Home</h1>
    <a href='/'>Main</a>
    <ul>
    <li>Name: ${user.name}</li>
    <li>Email: ${user.email}</li>
    </ul>
    `)
})

app.get('/profile', redirectLogin,(req, res) =>{
    const { user } = res.locals
})

app.get('/login', redirectHome, (req, res, ) => {
    res.send(`
    <h1>Login</h1>
    <form method='post' action='/Login'>
    <input type='email' name='email' placeholder='email' requred />
    <input type='password' name='password' placeholder='password' requred />
    <input type='submit' />
    </form>
    <a href= '/register'>Register</a>
    `)
})
app.get('/register', (req, res) => {
    res.send(`
    <h1>Register</h1>
    <form method='post' action='/Login'>
    <input name='name' placeholder='Name' requred />
    <input type='email' name='email' placeholder='email' requred />
    <input type='password' name='password' placeholder='password' requred />
    <input type='submit' />
    </form>
    <a href= '/login'>Login</a>
    `)
})


app.post('/login', redirectHome, (req, res) => {
    const {email,password } =req.body
    if(email && password){
        const user = users.find(
            user => user.email === email && user.password === password //TODO hash
        )
        if(user) {
            req.session.userId = user.id
        }
    }
    res.redirect('/login')
    
           })

    app.post('/register',redirectHome, (req, res) => {
    const { name, email, password } = req.body
if(name && email && password) {  //TODO validation
const exists = users.some(
    user => user.email === email
)
if (!exists) {
    const user = {
        id: users.length+1,
        name,
        password //TODO hash
    }
    users.push(user)
    req.session.userId = user.id
    return res.redirect('/home')
}
}
res.redirect('/register') //TODO qs /register?error =error.auth.emailTooShort
})

    app.post('/logout',redirectHome, (req, res) => {
        req.session.destroy(err =>{
            if(err) {
                return res.redirect('/home')
            }
            res.clearCookie(SESS_NAME)
            res.redirect('/login')
        })
    })
    

app.listen(PORT, () => console.log(
    `http://localhost:${PORT}`
))