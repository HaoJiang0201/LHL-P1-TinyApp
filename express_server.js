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
    id: "Admin",
    email: "polatouche0201@gmail.com",
    password: "123456"
  }
}
// Shot-Long URL Database (Object) 存储长短url链接的对象

var urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", UID: "Admin" },
  "9sm5xK": { longURL: "http://www.google.com", UID: "Admin" }
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
// Check if email exist in the User Database
// 检查邮箱是否已存在
function checkEmailExist(newEmail) {
  var checkResult = "";  // No such email
  for(key in users) {
    var usrInfo = users[key];
    if (usrInfo.email === newEmail) {
      checkResult = usrInfo.id;
    }
  }
  return checkResult;
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
// 1. Home Page 主页
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// 2. Register， Login & Logout 注册、登录和登出
app.post("/register", (req, res) => {
  // Get User Data
  var usrID = randomString(12);
  var usrEmail = req.body.email;
  var usrPassword = req.body.password;
  var usrPswConfirm = req.body.confirm_password;
  // if(usrEmail === "" || usrPassword  === "" || usrPswConfirm === "") {
  //   let templateVars = {
  //     userInfo: false,
  //     login_register: false,
  //     errorID: -1
  //   };
  //   res.render("login_register", templateVars);
  // }
  // Password Check
  if(usrPassword !== usrPswConfirm) { // Password and Confirm Password
    let templateVars = {
      userInfo: false,
      login_register: false,
      errorID: 1
    };
    res.render("login_register", templateVars);
  } else {
    if(usrPassword.length < 4) { // Password Digits Number Check
      let templateVars = {
        userInfo: false,
        login_register: false,
        errorID: 2
      };
      res.render("login_register", templateVars);
    } else {
      var emailCheck = checkEmailExist(usrEmail);
      if(emailCheck !== "") {
        let templateVars = { // Email Exist
          userInfo: false,
          login_register: false,
          errorID: 3
        };
        res.render("login_register", templateVars);
      } else {
        users[usrID] = {};
        users[usrID].id = usrID;
        users[usrID].email = usrEmail;
        users[usrID].password = usrPassword;
        res.cookie('userID', usrID);
        res.redirect("/urls");
      }
    }
  }
});

app.get("/register", (req, res) => {
  let id = req.cookies["userID"];
  let templateVars = {
    userInfo: false,
    login_register: false,
    errorID: 0
  }
  res.render("login_register", templateVars);
});

app.post("/login", (req, res) => {
  var inputEmail = req.body.email;
  var password = req.body.password;
  var matchedID = checkEmailExist(inputEmail);
  if(matchedID !== "") {
    if(password === users[matchedID].password) {
      res.cookie('userID', matchedID);
      res.redirect("/urls");
    } else {
      let templateVars = {
        userInfo: false,
        login_register: true,
        errorID: 2
      }
      res.render("login_register", templateVars);
    }
  } else {
    let templateVars = {
      userInfo: false,
      login_register: true,
      errorID: 1
    }
    res.render("login_register", templateVars);
  }
});

app.get("/login", (req, res) => { //
  let templateVars = {
    userInfo: false,
    login_register: true,
    errorID: 0
  }
  res.render("login_register", templateVars);
});

app.get("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect("/urls/");
});

// 3. Main Function Page (Home) : Short-Long URL Editor 主功能界面：长短URL编辑器（主页）
app.get("/urls", (req, res) => {
  let id = req.cookies["userID"];
  let templateVars = {};
  if(users[id]) {
    templateVars = {
      userInfo: users[id],
      urls: urlDatabase
    };
  } else {
    templateVars = {
      userInfo: false,
      urls: urlDatabase
    };
  }
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  var shortURL = randomString(6);
  var longURL = req.body.longURL;
  if(longURL.search("http://") < 0) {
    longURL = "http://" + longURL;
  }
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = longURL;
  urlDatabase[shortURL].UID = req.cookies["userID"];
  res.redirect("/urls");
});

// 4. Create New Short URL 新建URL链接缩写
app.get("/urls/new", (req, res) => {
  let id = req.cookies["userID"];
  let templateVars = {};
  if(users[id]) {
    templateVars = {
      userInfo: users[id]
    };
  } else {
    templateVars = {
      userInfo: false
    };
  }
  res.render("urls_new", templateVars);
});

// 5. Edit & Update Exist Short URL 编辑更新已有短URL
app.get("/urls/:shortURL", (req, res) => {
  let id = req.cookies["userID"];
  let templateVars = {};
  if(users[id]) {
    templateVars = {
      userInfo: users[id],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]
    };
  } else {
    templateVars = {
      userInfo: false,
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]
    };
  }
  res.render("urls_show", templateVars);
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
  if(!urlDatabase[short]) {
    urlDatabase[short] = {};
  }
  urlDatabase[short].longURL = long;
  res.redirect("/urls");
});

// 6. Jump to Long URL from Short URL 根据对应关系跳转到长链接
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  if(longURL.search("http://") < 0) {
    longURL = "http://" + longURL;
  }
  res.redirect(longURL);
});

// 7. Delete Exist URL 从列表中删除已有链接
app.post("/urls/:shortURL/delete", (req, res) => {
  var short = req.params.shortURL;
  delete urlDatabase[short];
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
