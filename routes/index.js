var express = require('express');
var router = express.Router();
var User = require('../models/Users');
var Account = require('../models/Account');
var { isLoggedIn, isNotLoggedIn, isAdmin} = require('./middlewares');

/* main page. */

router.get('/', function(req, res){
  res.render('home/main');
});





//관리자창 영역


//admin main 페이지
router.get('/adminmain', isAdmin, async function(req,res,next){
  res.render('adminpage/index');
});



//admin 회원 목록 페이지
router.get('/adminuser', isAdmin,async function(req, res, next) {
  var alluser = await User.find();
  res.render('adminpage/adminuser', {user:req.user, alluser:alluser});
});


//admin 회원검색 페이지
router.post('/search', isAdmin,async function(req,res,next){
  var users = await User.find({name:req.body.search});
  console.log(users);
  if (users == null){
    req.flash('danger','검색하신 회원이 없습니다');
    return res.redirect('back');
  }
  console.log(users);
  res.render('adminpage/userresult', {users:users, user:req.user});
});


function validAccountForm (form){
  var accnum = form.accountnumber || "";
  var accadmin = form.accountadmin || "";
  var accbank = form.accountbank || "";
  var place = form.adminplace || "";

  if (!accnum){
    return "계좌번호를 입력하세요";
  }
  else if(isNaN(accnum)){
    return "계좌번호를 숫자로 입력하세요";
  }

  if (!accadmin){
    return "계좌주를 입력하세요";
  }

  if (!accbank){
    return "은행을 입력하세요";
  }

  if (!place){
    return "인쇄실 장소를 입력하세요";
  }

  return null;
}




//admin 계좌정보 변경
router.get('/view_account', isAdmin,async function(req,res,next){
  var account = await Account.find();
  res.render('adminpage/viewaccount',{account:account});
});

//admin 계좌정보 추가
router.get('/addaccount', isAdmin,async function(req,res,next){
  res.render('adminpage/addacount');

})


//admin 계좌정보 추가 post방식으로 보낸거 받기
router.post('/addaccount', isAdmin,async function(req,res,next){
  var err = validAccountForm(req.body);
  if(err){
    req.flash('danger', err);
    return res.redirect('back');
  }

  new_account = new Account({
    accountnumber : req.body.accountnumber,
    accountadmin : req.body.accountadmin,
    accountbank : req.body.accountbank,
    adminplace : req.body.adminplace
  });

  await new_account.save();
  req.flash('success', '계좌정보 추가 완료');
  res.redirect('/view_account')

})

//계좌삭제
router.get('/delete_account/:id', isAdmin, async function(req,res,next){
  await Account.findByIdAndDelete(req.params.id);
  res.redirect('/view_account');
})

//계좌수정
router.get('/modify/:id', isAdmin, async function(req,res,next){
  Account.findById(req.params.id, function(err,account){
    return res.render('adminpage/modifyaccount', {account:account})
  });
});


//계좌 수정 post방식으롭 보낸거 받기
router.post('/fix_account:id', async function(req,res){
  console.log('hi')

  var err = validAccountForm(req.body);
  if(err){
    req.flash('danger', err);
    return res.redirect('back');
  }

  
  let acc = {};
  acc.accountnumber = req.body.accountnumber,
  acc.accountadmin = req.body.accountadmin,
  acc.accountbank = req.body.accountbank,
  acc.adminplace = req.body.adminplace

  let up_acc = {_id:req.params.id};

  Account.update(up_acc, acc,function(err){
    if(err){
      console.log(err);
      return;
    } else {
      req.flash('success', '계좌 정보 수정 성공!');
      res.redirect('/view_account');
    }
  });
});










//여기까지 관리자창





/* manual page. */
router.get('/manual', function(req,res,next){
  res.render('home/manual');
});














//delete user
router.get('/delete:id', isLoggedIn, async function(req, res, next){
  console.log('hi');
  await User.findByIdAndDelete(req.params.id);
  res.redirect('back');
});


module.exports = router;
