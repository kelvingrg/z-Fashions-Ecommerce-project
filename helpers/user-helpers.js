var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let email = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData.Email });
      if (email) {
        console.log("same email");
        response.status = true;
        resolve(response);
      } else {
        userData.Password = await bcrypt.hash(userData.Password, 10);
        db.get()
          .collection(collection.USER_COLLECTION)
          .insertOne(userData)
          .then((data) => {
            resolve(data.insertedId);
          });
        console.log("no same email");
        resolve({ status: false });
      }
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: userData.Email });
      if (user) {
        bcrypt.compare(userData.Password, user.Password).then((status) => {
          if (status) {
            console.log("login success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login faild");
            resolve({ status: false });
          }
        });
      } else {
        console.log("login faild");
        resolve({ status: false });
      }
    });
    },
  
  //user checking

    isExist: (isuser) => {
        var user = { ...isuser.user };
       async function nameGetter(user) {
          
            let email = await db
              .get()
              .collection(collection.USER_COLLECTION)
               .findOne({ Email: user.Email });
            var Uemail = {...email};
           if (Uemail.Email !== user.Email) {
             isuser.destroy();
           }
           
        }
        nameGetter(user)
          
        // console.log(user);

    //  var s_user = isuser.user;
  
    // function checkUser(user, s_user) {
    //   if (user !== s_user) {
    //     // isuser.destroy(() => {
    //     //   console.log("session destroyed");
    //     // });
    //   }
    // }

    
  },
};