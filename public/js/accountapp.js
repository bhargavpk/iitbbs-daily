const userMessageBox = document.getElementById('user-message');
const postBox = document.getElementsByClassName('post-box')[0];
const postPopBox = document.getElementById('post-populate-box');    

const userName = userMessageBox.textContent.split("'")[0];
console.log(userName);
//Request functions

addPost = function(postObj){
        var newPostObj = document.createElement('div');
        var newPostHeader = document.createElement('div');
        var newPostHeaderAuthor = document.createElement('div');
        var newPostHeaderDate = document.createElement('div');
        var newPostContent = document.createElement('div');
        var newPostNumInfo = document.createElement('div');
        var newAppNum = document.createElement('div');
        var newDisappNum = document.createElement('div');
        newPostObj.className = 'post-ele';
        newPostHeader.className = 'post-ele-header';
        newPostHeaderAuthor.className = 'header-author';
        newPostHeaderDate.className = 'header-date';
        newPostNumInfo.className = 'num-info-box';
        newAppNum.className = 'app-num';
        newDisappNum.className = 'app-num';
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
        newPostObj.appendChild(newPostHeader);
        newPostObj.appendChild(newPostContent);
        newPostObj.appendChild(newPostNumInfo);
        postPopBox.appendChild(newPostObj);
}

populatePostContent = async function(){
    const res = await  fetch('/user_posts?username='+userName);
    const data = await res.json();
    data.forEach(postObj => {
        addPost(postObj);
    });
}
populatePostContent();




