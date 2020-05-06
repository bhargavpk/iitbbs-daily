const userMessageBox = document.getElementById('user-message');
const postBtn = document.getElementById('post-btn');
const postInput = document.getElementById('post-input');
const postBox = document.getElementsByClassName('post-box')[0];
const postPopBox = document.getElementById('post-populate-box');
const postInputError = document.getElementById('post-input-err');
const forIcon = document.getElementById('for-icon');
const backIcon = document.getElementById('back-icon');      

var userName = userMessageBox.textContent.split(" ")[1];

//Request functions
approve_patch = function(postId, newAppNum){
    fetch('/patch_test?user='+userName,{
        method:'PATCH',
        headers:{
            'Accept':'application/json',
            'Content-type':'application/json'
        },
        body:JSON.stringify({
            id:postId
        })
    }).then(res => {
        return res.json();
    }).then(data => {
            approve_patchReq(postId,data.status, newAppNum);
    });
}

disapprove_patch = function(postId,newDisappNum){
    var status;
    fetch('/patch_test?user='+userName,{
        method:'PATCH',
        headers:{
            'Accept':'application/json',
            'Content-type':'application/json'
        },
        body:JSON.stringify({
            id:postId
        })
    }).then(res => {
        return res.json();
    }).then(data => {
            disapprove_patchReq(postId,data.status,newDisappNum); 
    });
}

approve_patchReq = function(postId,status,newAppNum){
    fetch('/patch_post?user='+userName+'&update=inc',{
        method:'PATCH',
        headers:{
            'Accept':'application/json',
            'Content-type':'application/json'
        },
        body:JSON.stringify({
            id:postId,
            status
        })
    }).then(res => {
        return res.json();
    }).then(data => {
        console.log(data);
        newAppNum.textContent = data.numApproves+' Approves';
    });
}
disapprove_patchReq = function(postId,status,newDisappNum){
    fetch('/patch_post?user='+userName+'&update=dec',{
        method:'PATCH',
        headers:{
            'Accept':'application/json',
            'Content-type':'application/json'
        },
        body:JSON.stringify({
            id:postId,
            status
        })
    }).then(res => {
        return res.json();
    }).then(data => {
        console.log(data);
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
        // var headNode = document.createTextNode(postObj.author);
        newPostHeaderAuthor.textContent = postObj.author
        newPostHeaderDate.textContent = postObj.createdAt.split('T')[0];
        var textNode = document.createTextNode(postObj.description);
        // var appNum = document.createTextNode(postObj.numApproves+' Approves');
        // var disappNum = document.createTextNode(postObj.numDisapproves+' Disapproves');
        //newPostHeader.appendChild(headNode);
        newPostContent.appendChild(textNode);
        // newAppNum.appendChild(appNum);
        // newDisappNum.appendChild(disappNum);
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
           approve_patch(newPostObj.id, newAppNum);
        });
        disappBtn.addEventListener('click',e => {
            disapprove_patch(newPostObj.id, newDisappNum);
        });
}

populatePostContent = async function(skip){
    const res = await  fetch('/get_posts?user='+userName+'&skip='+skip);
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
    fetch('/post',{
        method:'POST',
        headers:{
            'Accept':'application/json',
            'Content-type':'application/json'
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
            postInputError.textContent = 'Post cant be empty';
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
})



