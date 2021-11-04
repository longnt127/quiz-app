// TODO(you): Write the JavaScript necessary to complete the assignment.
const url = 'https://wpr-quiz-api.herokuapp.com/attempts';

const header = document.querySelector('header');
const body = document.querySelector('body');
const author = document.querySelector('.author');
const introduction = document.querySelector('#introduction');
const btnStart = document.querySelector('.btn__start');

const attemptQuiz = document.querySelector('#attempt-quiz');
const attemptQuizContent = document.querySelector('.attempt-quiz__content');

const confirmation = document.querySelector('#confirm');
const confirmCancelBtn = document.querySelector('.btn-cancel');
const confirmYesBtn = document.querySelector('.btn-yes');
confirmCancelBtn.addEventListener('click', cancelSubmit);
confirmYesBtn.addEventListener('click', checkAnswers);

const btnSubmit = document.querySelector('.attempt-quiz__submit');
const reviewQuiz = document.querySelector('#review-quiz');

const resultView = document.querySelector('#result-view');
const total_score = document.querySelector('.result-view__score');
const percent = document.querySelector('.result-view__precent');
const scoreText = document.querySelector('.result-view__feedback');

const tryAgainBtn = document.querySelector('.btn-tryagain');
tryAgainBtn.addEventListener('click', restartQuiz);

btnStart.addEventListener('click', showAttemptQuiz);
btnSubmit.addEventListener('click', showConfirmForm);

let id_qn_answer = {};
let attempt_id;

function onResponse(response){
    console.log('status ' + response.status);
    console.log(response);
    return response.json();
}
function openQuestion(json){
    const questions = json.questions;
    attempt_id = json._id;

    createQuestion(questions)
    handleSelectEvent();

}
// fetch url to populate question
fetch(url, {
    method: 'POST'
}).then(onResponse).then(openQuestion)

function showAttemptQuiz() {  
    attemptQuiz.classList.remove('hidden');
    author.classList.add('hidden');
    introduction.classList.add('hidden');

    body.scrollIntoView(true);
}

let wrapAnswers;
let questionCounter = 0;
function createQuestion(questions) {
    for(let ques of questions) {
        questionCounter++;
        quizNumber = document.createElement('div');
        quizNumber.classList.add('attempt-quiz__number');
        quizNumber.innerText = `Question ${questionCounter} of 10`;

        quizQuestion = document.createElement('div');
        quizQuestion.classList.add('attempt-quiz__question');
        quizQuestion.innerText = `${ques.text}`;

        attemptQuizContent.appendChild(quizNumber);
        attemptQuizContent.appendChild(quizQuestion);

        createQuestionContent(ques, ques.answers);
        attemptQuizContent.appendChild(wrapAnswers);
    }
    if(btnSubmit.classList.contains('hidden')){
        btnSubmit.classList.remove('hidden');
    }  
}

function createQuestionContent(ques, answers) {
    const answersLength = answers.length;
    wrapAnswers = document.createElement('form'); 
    wrapAnswers.classList.add('attempt-quiz__answer');
    let counter = 0;
    for(let i = 0; i < answersLength; i++) {
        counter ++;
        const answerOption = document.createElement('div');
        answerOption.classList.add('answer-option');

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = ques._id;
        input.id = 'choice' + i + 'question' + questionCounter;
        input.value = i;

        const label = document.createElement('label');
        label.htmlFor = input.id;
        label.innerText = answers[i];

        answerOption.appendChild(input);
        answerOption.appendChild(label);
        wrapAnswers.appendChild(answerOption);
    }
}


function handleSelectEvent() {
    const  choices = document.querySelectorAll('.answer-option');
    for(let choice of choices) {
        choice.addEventListener('click', onClickSelected);
    }

}

function onClickSelected(e) {
    let answerSelected = e.currentTarget;
    let div_beforeSelected;
    let input_selected = answerSelected.children[0];
    input_selected.checked = true;
    let form_selected = answerSelected.parentNode;
    for(let input of form_selected) {
        if(input !== input_selected) {
            div_beforeSelected = input.parentNode;
            div_beforeSelected.classList.remove('selected');
        }
        answerSelected.classList.add('selected');
    } 
}

function disableSelect(){
    const input_list = document.querySelectorAll('input');
    let div_input;

    for(const input of input_list){
        input.disabled = true;
        div_input = input.parentNode;
        div_input.removeEventListener('click', onClickSelected);
    }
}

function showConfirmForm() {
    document.body.classList.add('no-scroll');
    confirmation.style.top = window.pageYOffset + 'px'; 
    confirmation.classList.remove('hidden');
}

function cancelSubmit() {   
    attemptQuizContent.scrollIntoView();
    document.body.classList.remove('no-scroll');  
    confirmation.classList.add('hidden');
}

function checkAnswers() {
    disableSelect();
    cancelSubmit();

    const inputs = document.querySelectorAll('input[type="radio"]'); 
    for(const input of inputs){
        if(input.checked){ 
            id_qn_answer[input.name] = input.value;          
        }
    }
    submitAnswer(attempt_id, id_qn_answer);  
}

function handleSubmitResult(json) {
    correct_answers = json.correctAnswers;
    const answers = document.querySelectorAll('input[type="radio"]'); 
    for (let answer of answers) {
        const correctDiv = answer.parentNode;
        for(let correct_ans in correct_answers){
            if(correct_ans == answer.name){
                if(correct_answers[correct_ans] == answer.value){
                    const divCorrectAnswer = document.createElement('div');
                    divCorrectAnswer.classList.add('correct__answer');
                    divCorrectAnswer.textContent = 'Correct answer';
                    correctDiv.appendChild(divCorrectAnswer);
                    correctDiv.style.backgroundColor = '#ddd'

                    if(answer.checked){
                        correctDiv.classList.add('correct--background')
                    }
                    
                }else{
                    if(answer.checked){
                        const divWrongAnswer = document.createElement('div');
                        divWrongAnswer.classList.add('correct__answer');
                        divWrongAnswer.textContent = 'Your answer';
                        correctDiv.appendChild(divWrongAnswer);
                        correctDiv.classList.add('wrong--background');
                    }
                    
                }
            }
        }
    }
    
    displayResult(json);
}

function displayResult(json){
    
    const score = json.score;
    total_score.textContent = `${score}/10`;
    percent.textContent = `${score * 10}%`;
    scoreText.textContent = json.scoreText;
    
    reviewQuiz.classList.remove('hidden');
    resultView.classList.remove('hidden');
    btnSubmit.classList.add('hidden');
    resultView.scrollIntoView();
}


function submitAnswer(attempt_id, id_qn_answer){
    fetch(url + '/' + attempt_id + '/submit',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            answers: id_qn_answer,  
        })
        
    })  
    .then(onResponse)
    .then(handleSubmitResult)
}

function restartQuiz(){
    total_score.innerHTML = '';
    percent.innerHTML = '';
    scoreText.innerHTML = '';

    introduction.classList.remove('hidden');
    attemptQuizContent.innerHTML = '';
    attemptQuiz.classList.add('hidden');
    resultView.classList.add('hidden');

    questionCounter = 0;
    id_qn_answer = {};
    fetch(url, {
    method: 'POST'
    }).then(onResponse).then(openQuestion);
    header.scrollIntoView(true);
    
}
