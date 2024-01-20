const express = require("express")
const ejs = require("ejs")
const axios = require('axios')
const mysql = require('mysql')
const bodyParser = require('body-parser')


const app = express()

app.use(bodyParser.urlencoded({extended: false}))

// pode renderizar os arquivos EJS armazenados no diretório de visualizações (por padrão, a pasta views) sem especificar explicitamente a extensão ".ejs" em cada renderização.
app.set("view engine", 'ejs')

//permite que você acesse os arquivos estáticos armazenados na pasta "public" diretamente pelo navegador
app.use(express.static("public"))

// para analisar o corpo da solicitação, analisar o corpo de uma solicitaçao POST!
app.use(express.urlencoded({extended:true}))


// criando uma conexão com banco de dados
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "usuario"
})
// Teste caso a conexão seja estabelecida com sucesso print no console uma msg de conexão concedida.
connection.connect(err => {
    if(err) throw err
        console.log("Conexão estabelecida com SUCESSO!")
})

// funçao assicrona armazendo um tentativa de conexão com um API caso seja bem sucedida rendenizara a pasta e o que foi solicitado da API.
//caso error, um catch printando no console o Type e de error e o que ouve de errado.

app.get('/', async (req, res) => {
    try{
        // Conexão com a API
        const response = await axios.get('https://fakestoreapi.com/products')
        const products = response.data
        
        res.render('products', { products })
    }

    catch (error) {
        console.log(error)
    }
})

app.get('/eletronicos', async (req, res) => {
    try {
        const response = await axios.get('https://fakestoreapi.com/products/category/electronics')
        const products_elet = response.data
        res.render('products_elet', { products_elet })
    }
    catch (error) {
        console.log(error)
    }
})

app.get('/joias', async (req, res) => {
    try {
        const response = await axios.get('https://fakestoreapi.com/products/category/jewelery')
        const products_joias = response.data
        res.render('products_joias', { products_joias })
    }
    catch (error) {
        console.log(error)
    }
})

app.get('/clothing', async (req, res) => {
    try {
        const resWoman = await axios.get("https://fakestoreapi.com/products/category/women's clothing")
        const resMen = await axios.get("https://fakestoreapi.com/products/category/men's clothing")
        const clothingWoman = resWoman.data
        const clothingMen = resMen.data
        const vest = await [...clothingWoman, ...clothingMen]
        

        res.render('products_clothing', { vest })
    }
    catch (error) {
        console.log(error)
    }
})

// Cadastro 

app.get("/cadastro", (req, res) => {
    res.render('cadastro')
})

app.post('/cadastro', (req, res) => {
    const {Nome, Sobrenome, Cell, Email, Senha} = req.body
    const query = 'INSERT INTO pessoa (Nome, Sobrenome, Cell, Email, Senha) VALUES (?, ?, ?, ?, ?)'
    connection.query(query, [Nome, Sobrenome, Cell, Email, Senha], (err, rows) => {
        if(err) throw err
        res.redirect('/')
    })
})

// deletar conta 
app.get('/delete/:Nome', (req, res) => {
    const { Nome, Sobrenome} = req.params
    const query = 'DELETE FROM pessoa WHERE Nome = ?, Sobrenome = ? limit 1'
    connection.query(query, [Nome, Sobrenome], (err) => {
        if(err) throw err
        res.redirect('/')
    })
})
// Adicionar ao Carrinho

let cart = []

app.post("/carrinho", async (req, res) => {
    const produto = await parseInt(req.body.Comprado)
    const response = await axios.get(`https://fakestoreapi.com/products/${produto}`)
    const productsCart = response.data
    cart.push(productsCart)
    res.redirect('/')
})

app.get('/carrinho', (req, res) => {
    res.render('carrinho', {cart})
})

// remover items add ao carrinho 
app.post('/remover', (req, res) => {
    const itemRemove = parseInt(req.body.removido)
    const removeIndex = cart.findIndex(item => item.id === itemRemove)
    if(removeIndex !== -1) {
        cart.splice(removeIndex, 1)
    }

    res.redirect('carrinho')
})


app.listen(3001, () => {
    console.log("Server ON, port 3001...")
})