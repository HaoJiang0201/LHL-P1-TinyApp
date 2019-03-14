/******** Individual Project ********/
// Name: Tiny App
// Organization: Lighthouse Lab
// Course: Web Developer
// Student: Hao Jiang
// Time: W2D2 - W2D5
/************************************/

/******** Extra Module Connect 外部模块连接  ********/
var express = require("express");
var cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

/******** Global Settings 全局设置、初始化 ********/
var PORT = 8080; // default port 8080
// User Info. 用户信息
const users = {
  "Admin": {
    id: "000000",
    email: "polatouche0201@gmail.com",
    password: "123456"
  },
}
// Shot-Long URL Database (Object) 存储长短url链接的对象
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// Random Generate and return a string by given the "string length" to the function
// 给定字符串长度，随机生成并返回一个字符串
function randomString(size) {
  let str = "";
  let arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l',
      'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
      'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
      //'-','.','~','!','@','#','$','%','^','&','*','(',')','_',':','<','>','?'];
  for (let i = 0; i < size; i++) {
    let pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
}

/******** App Settings & Server Up 应用设置，服务器启动、监听 ********/
var app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}!`);
});

/******** All GET and POST Activities App所有的活动监控 ********/
// 1. Main Page 主页
app.get("/", (req, res) => {
  res.redirect("/login");
});

// 2. Register， Login & Logout 注册、登录和登出
app.post("/register", (req, res) => {   // 从
  var usrID = randomString(12);
  var usrEmail = req.body.email;
  var usrPassword = req.body.password;
  var usrPswConfirm = req.body.confirm_password;
  if(usrPassword !== usrPswConfirm) {
    let templateVars = {
      userID: req.cookies["userID"],
      login_register: false,
      password_confirm: false
    };
    res.render("login_register", templateVars);
  } else {
    users[usrID] = {};
    users[usrID].id = usrID;
    users[usrID].email = usrEmail;
    users[usrID].password = usrPassword;
    res.cookie('userID', usrEmail);
    res.redirect("/urls");
    //res.redirect("/register");
  }
});

app.get("/register", (req, res) => {
  let templateVars = {
    userID: req.cookies["userID"],
    login_register: false,
    password_confirm: true
  };
  res.render("login_register", templateVars);
});

app.post("/login", (req, res) => {
  res.cookie('userID', req.body.userName);
  res.redirect("/urls");
});

app.get("/login", (req, res) => { //
  let templateVars = {
    //username: req.cookies["userID"],
    login_register: true
  };
  res.render("login_register", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect("/urls/");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    userID: req.cookies["userID"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  var shortURL = randomString(6);
  var longURL = req.body.longURL;
  if(longURL.search("http://") < 0) {
    longURL = "http://" + longURL;
  }
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls/");
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    userID: req.cookies["userID"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    userID: req.cookies["userID"],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[req.params.shortURL];
  if(longURL.search("http://") < 0) {
    longURL = "http://" + longURL;
  }
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  var short = req.params.shortURL;
  delete urlDatabase[short];
  res.redirect("/urls");
});

app.get("/urls/:shortURL/update", (req, res) => {
  res.redirect("/urls/" + req.params.shortURL);
});

app.post("/urls/:shortURL/update", (req, res) => {
  var long = req.body.longURL;
  if(long.search("http://") < 0) {
    long = "http://" + long;
  }
  var short = req.params.shortURL;
  urlDatabase[short] = long;
  res.redirect("/urls");
});



// X. Test Pages
// app.get("/hello", (req, res) => {
//   let templateVars = { greeting: 'Hello World!' };
//   res.render("hello_world", templateVars);
//   //res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/treasure", (req, res) => {
//   const user = req.cookies.usename && users[req.cookies.username];
//   if(user) {
//    res.render('treasure', {user:usr});
//   } else {
//    res.redirect("/");
//   }
// });
