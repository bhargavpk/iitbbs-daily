const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const formSignUp = document.getElementById('form-signup');
const formSignIn = document.getElementById('form-signin');
const signUpContainer = document.getElementsByClassName('sign-up-container')[0];
const signInContainer = document.getElementsByClassName('sign-in-container')[0];
const signUp = {
	firstNameInput: signUpContainer.getElementsByClassName('first-name')[0],
	lastNameInput: signUpContainer.getElementsByClassName('last-name')[0],
	userNameInput: signUpContainer.getElementsByClassName('user-name')[0],
	emailInput: signUpContainer.getElementsByClassName('email')[0],
	password: signUpContainer.getElementsByClassName('password')[0]
};
const signIn = {
	userNameInput :signInContainer.getElementsByClassName('user-name')[0],
	password: signInContainer.getElementsByClassName('password')[0]
}

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});

formSignUp.addEventListener('click',(e)=>{
	e.preventDefault();
	const userObj = {
		name:{
			firstName: signUp.firstNameInput.value,
			lastName: signUp.lastNameInput.value,
		},
		userName: signUp.userNameInput.value,
		email: signUp.emailInput.value,
		password: signUp.password.value
	};
	fetch('/signup',{
		method:'POST',
		headers:{
            'Accept':'application/json',
            'Content-type':'application/json'
		},
		body: JSON.stringify(userObj)
	}).then(res => {
		return res.json();
	}).then(data => {
		if(data.success === true)
			window.location.href = '/test_success';
		else
		{
			if(!data.error_mess)
			{
				 const fieldName = Object.getOwnPropertyNames(data.error.errors)[0];
				 document.getElementById('signup-val-error').textContent = data.error.errors[fieldName].message;
			}
			else
				document.getElementById('signup-val-error').textContent = data.error_mess;
		}
	});
});

formSignIn.addEventListener('click',(e)=>{
	e.preventDefault();
	const findUser = {
		userName: signIn.userNameInput.value,
		password: signIn.password.value
	};
	fetch('/login',{
		method:'POST',
		headers:{
			'Accept':'application/json',
			'Content-type':'application/json'
		},
		body: JSON.stringify(findUser)
	}).then(res => {
		return res.json();
	}).then(data => {
		if(!data.error)
		{
				if(data.status_pass === 'right')
					window.location.href = '/test_success';
				else
					document.getElementById('signin-val-error').textContent = 'Invalid Username or password';
		}
	})
})



