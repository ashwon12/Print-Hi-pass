// routes/docs.js
//models/Docs관련 백앤드
var express= require("express");
var router=express.Router();
var Doc=require("../models/Docs");
var { isLoggedIn, isNotLoggedIn } = require('./middlewares');
var multer = require('multer');
var errorCatcher = require('../lib/async-error'); 


//저장소, 파일 이름 설정
const storage = multer.diskStorage({
   destination(req, file, callback) { 
     callback(null, 'uploads'); 
    }, 
    filename(req, file, callback) { 
      let array = file.originalname.split('.'); 
      array[0] = array[0] + '_'; 
      array[1] = '.' + array[1]; 
      array.splice(1, 0, Date.now().toString()); 
      const result = array.join(''); 
      console.log(result); 
      callback(null, result); 
    } 
  });

  const upload = multer({ 
    storage, 
    limits: { 
      files: 10, 
      fileSize: 1024 * 1024 * 1024, 
    } 
  });



//Index
router.get("/", isLoggedIn, function(req, res, next) {
  key = req.query.key
  if (key == "0"){
    title="5공학관"
  }
  else if (key == "1") {
    title="명진당"
  }
  // var posts = await Post.find();
  //   // Post.find({})
  //   // .sort("-createdAt")
  //   // .exec(function(err,posts){
  //   //     if(err)return  res.json(err);
  //   //     
  //   // });
  //   console.log(posts);
    res.render("docs/index",{title:title});
});

// New
router.get("/new",function(req,res){
    res.render("docs/new");
})


//pay
router.get("/pay", errorCatcher(async(req,res,next) => {
    res.render("docs/pay",{payment : req.query.payment});
}));


//board
router.get("/board",async function(req,res){
  var docs = await Doc.find();
  console.log(docs)
  res.render("docs/board",{docs:docs});
})



function validCreateForm (form){
  // 글쓰기 폼 검사
  // 내용이랑 페이지수, 매수가 비어있으면 오류
  // 페이지 수, 매수 숫자 아니면 오류
  //var title = form.title || "";
 // var content = form.content || "";
  var page = form.page || "";
  var count = form.count || "";
  var time = form.time_frop || "";
  // if( !title ){
  //   return "제목을 입력하세요";
  // }

  // if( !content ){
  //   return "내용을 입력하세요";
  // }


  if( !page ){
    return "페이지수를 입력하세요";
  }
  else if (isNaN(page)){
    return "페이지수를 숫자로 입력하세요";
  }

  if( !count ){
    return "매수를 입력하세요";
  }
  else if (isNaN(count)){
    return "매수를 숫자로 입력하세요";
  }

  if (!time){
    return "예약할 시간을 선택하세요"
  }

  return null;
}

//create
router.post("/", upload.array('photo',1), async function(req,res){
//파일 업로드
try { 
  const files = req.files; 
  let originalName = ''; 
  let fileName = ''; 
  let mimeType = ''; 
  let size = 0; 
  if (Array.isArray(files)) { 
    console.log(`files is array~`); 
    
    originalName = files[0].originalname; 
    fileName = files[0].filename; 
    mimeType = files[0].mimetype; 
    size = files[0].size; 
  
  } else { 
    console.log(`files is not array~`); 
    originalName = files[0].originalname; 
    fileName = files[0].filename; 
    mimeType = files[0].mimetype; 
    size = files[0].size; 
  }
  
  console.log(`file inform : ${originalName}, ${fileName}, ${mimeType}, ${size}`); 
  
  // res.writeHead('200', { 
  //   'Content-type': 'text/html;charset=utf8' 
  // }); 
  // res.write('<h3>upload success</h3>'); 
  // res.write(`<p>original name = ${originalName}, saved name = ${fileName}<p>`); 
  // res.write(`<p>mime type : ${mimeType}<p>`); 
  // res.write(`<p>file size : ${size}<p>`); 
  // res.end(); 
} catch (err) { 
  console.dir(err.stack); 
}

//여기까지


  var err = validCreateForm(req.body);
  if (err){
    req.flash('danger', err);
    return res.redirect('back');
  }

  // console.log(req.body.page);
  // console.log(req.body.count);

  var color = (req.body.allblack == 'on') ? 'on' : 'off' ; 
  //만약 color가 off 일때는 off 출력 on일때는 on 출력하는 상방향 연산자????! 암튼 그거임
  var side = (req.body.double_side == 'on') ? 'on' : 'off' ;

  var total_pay = req.body.page * req.body.count;
  if (color == 'on'){
    total_pay = total_pay * 100;
  }
  else {
    total_pay = total_pay * 50;
  }

  if (side == "on") total_pay = total_pay*2;

  console.log(total_pay);

  //에러 없으면 디비에 저장
  var new_doc = new Doc({
    //title : req.body.title,
    author:req.user._id,
    content : req.body.content,
    allblack : color,
    double_side : side,
    page : req.body.page,
    count : req.body.count,
    payment : total_pay,
    time_frop : req.body.time_frop
  });
  console.log(new_doc);

 await new_doc.save();
  req.flash('success', "글쓰기 성공");
  res.redirect("/docs/pay?payment="+new_doc.payment);
});


// // show
// router.get("/:id", function(req, res){
//     Post.findOne({_id:req.params.id}, function(err, post){
//       if(err) return res.json(err);
//       res.render("posts/show", {post:post});
//     });
//   });
  
//   // edit
//   router.get("/:id/edit", function(req, res){
//     Post.findOne({_id:req.params.id}, function(err, post){
//       if(err) return res.json(err);
//       res.render("posts/edit", {post:post});
//     });
//   });
  
//   // update
//   router.put("/:id", function(req, res){
//     req.body.updatedAt = Date.now(); // 2
//     Post.findOneAndUpdate({_id:req.params.id}, req.body, function(err, post){
//       if(err) return res.json(err);
//       res.redirect("/posts/"+req.params.id);
//     });
//   });
  
//   // destroy
//   router.delete("/:id", function(req, res){
//     Post.deleteOne({_id:req.params.id}, function(err){
//       if(err) return res.json(err);
//       res.redirect("/posts");
//     });
//   });
  
  module.exports = router;
  