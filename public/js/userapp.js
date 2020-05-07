const userMessageBox = document.getElementById('user-message');
var userName = userMessageBox.textContent.split(" ")[1];
fetch('/user/auth',{
    method:'POST',
    headers:{
        'Accept':'application/json',
        'Content-type':'application/json',
        'Authorization':'Bearer '+document.cookie.split(";")[0].split("=")[1]
    },
    body:JSON.stringify({username:userName})
}).then(res => {
    return res.json();
}).then(data =>{
    if(data.error)
        window.location.href = '/';
});

const postBtn = document.getElementById('post-btn');
const postInput = document.getElementById('post-input');
const postBox = document.getElementsByClassName('post-box')[0];
const postPopBox = document.getElementById('post-populate-box');
const postInputError = document.getElementById('post-input-err');
const forIcon = document.getElementById('for-icon');
const backIcon = document.getElementById('back-icon');      

//Request functions
approve_patchReq = function(postId,newAppNum){
    fetch('/patch_post?&update=inc',{
        method:'PATCH',
        headers:{
            'Accept':'application/json',
            'Content-type':'application/json',
            'Authorization':'Bearer '+document.cookie.split(";")[0].split("=")[1]
        },
        body:JSON.stringify({
            user:userName,
            id:postId
        })
    }).then(res => {
        return res.json();
    }).then(data => {
        console.log(data);
        if(!data.error)
            if(!data.status)
                newAppNum.textContent = data.numApproves+' Approves';
    });
}
disapprove_patchReq = function(postId,newDisappNum){
    fetch('/patch_post?&update=dec',{
        method:'PATCH',
        headers:{
            'Accept':'application/json',
            'Content-type':'application/json',
            'Authorization':'Bearer '+document.cookie.split(";")[0].split("=")[1]
        },
        body:JSON.stringify({
            user:userName,
            id:postId
        })
    }).then(res => {
        return res.json();
    }).then(data => {
        console.log(data);
        if(!data.error)
            if(!data.status)
                newDisappNum.textContent = data.numDisapproves+' Disapproves';
    });
}

addPost = function(postObj){
        var newPostObj = document.createElement('div');
        var newPostHeader = document.createElement('div');
        var newPostHeaderAuthor = document.createElement('div');
        var newPostHeaderDate = document.createElement('div');
        var newPostContent = document.createElement('div');
        var newPostNumInfo = document.createElement('div');
        var newAppNum = document.createElement('div');
        var newDisappNum = document.createElement('div');
        var newBtnBox = document.createElement('div');
        var appBtn = document.createElement('button');
        var disappBtn = document.createElement('button');
        newPostObj.className = 'post-ele';
        newPostObj.id = postObj._id;
        newPostHeader.className = 'post-ele-header';
        newPostHeaderAuthor.className = 'header-author';
        newPostHeaderDate.className = 'header-date';
        newPostNumInfo.className = 'num-info-box';
        newAppNum.className = 'app-num';
        newDisappNum.className = 'app-num';
        newBtnBox.className = 'btn-box';
        appBtn.className = 'approve-btn';
        disappBtn.className = 'disapprove-btn';
        appBtn.textContent = 'Approve';
        disappBtn.textContent = 'Disapprove';
        newPostHeaderAuthor.textContent = postObj.author
        newPostHeaderDate.textContent = postObj.createdAt.split('T')[0];
        var textNode = document.createTextNode(postObj.description);
        newPostContent.appendChild(textNode);
        newAppNum.textContent = postObj.numApproves+' Approves';
        newDisappNum.textContent = postObj.numDisapproves+' Disapproves';
        newPostHeader.appendChild(newPostHeaderAuthor);
        newPostHeader.appendChild(newPostHeaderDate);
        newPostNumInfo.appendChild(newAppNum);
        newPostNumInfo.appendChild(newDisappNum);
        newBtnBox.appendChild(appBtn);
        newBtnBox.appendChild(disappBtn);
        newPostObj.appendChild(newPostHeader);
        newPostObj.appendChild(newPostContent);
        newPostObj.appendChild(newPostNumInfo);
        newPostObj.appendChild(newBtnBox);
        postPopBox.appendChild(newPostObj);

        appBtn.addEventListener('click',e => {
           approve_patchReq(newPostObj.id, newAppNum);
        });
        disappBtn.addEventListener('click',e => {
            disapprove_patchReq(newPostObj.id, newDisappNum);
        });
}

populatePostContent = async function(skip){
    const res = await  fetch('/user/get_posts?user='+userName+'&skip='+skip);
    const data = await res.json();
    data.forEach(postObj => {
        addPost(postObj);
    });
    return data.length;
}
populatePostContent(0);

document.getElementById('acc-nav').addEventListener('click',(e) => {
    window.location.href = '/account?username='+userName;
})

postBtn.addEventListener('click',(e) => {
    const postBody = postInput.value;
    fetch('/user/post',{
        method:'POST',
        headers:{
            'Accept':'application/json',
            'Content-type':'application/json',
            'Authorization':'Bearer ' + document.cookie.split(";")[0].split("=")[1]
        },
        body:JSON.stringify({
            author: userName,
            description: postBody
        })
    }).then(res => {
        return res.json();
    }).then(data => {
        if(data.error)
        {
            postInputError.textContent = data.error;
            setTimeout(()=>{
                postInputError.textContent = '';
            },3000)
        }
        else
            location.reload();
    })
});

var skip = 0;

forIcon.addEventListener('click',(e) => {
    Array.from(postPopBox.children).forEach(postObj => {
        postPopBox.removeChild(postObj);
    })
    populatePostContent(skip+1).then((count) => {
        if(count == 0)
            populatePostContent(skip);
        else
            skip++;
    });
});
backIcon.addEventListener('click',(e) => {
    if(skip!=0)
    {
        Array.from(postPopBox.children).forEach(postObj => {
            postPopBox.removeChild(postObj);
        })
        populatePostContent(skip-1);
        skip--;
    }
});

getAccount = async function(userInp){
    const res = await fetch('/account_test?username='+userInp);
    const data = await res.json();
    return data;
}
document.getElementById('search-icon').addEventListener('click',(e) => {
    const userInp = document.querySelector('input').value;
    getAccount(userInp).then(data => {
        if(data.status === true)
            window.location.href = '/account?username='+userInp;
        else
        {
            document.getElementById('search-err').textContent = 'No user found';
            setTimeout(()=>{
                document.getElementById('search-err').textContent = '';
            },3000)
        }
    })
});

document.getElementById('logout-nav').addEventListener('click',(e) => {
    fetch('/logout?username='+userName,{
        method:'POST',
        headers:{
            'Accept':'application/json',
            'Content-type':'application/json',
            'Authorization':'Bearer ' + document.cookie.split(";")[0].split("=")[1]
        }
    }).then(res =>{
        return res.json();
    }).then(data =>{
        if(!data.error)
        {
            if(data.status === true)
                document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
            window.location.href = '/';
        }
    })
})



