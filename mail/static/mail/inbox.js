document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  //create new email
  document.querySelector('#sendNewMail').addEventListener('click', send_new_mail);

  // By default, load the inbox
  //load_mailbox('inbox');
});



function send_new_mail() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // perform basic validation before POST to prescreen simple errors
  var completeSend = true
  var msg = ""
  if (recipients.length === 0) { // improve with a regular expression
      completeSend = false
      msg = "Please add at least one recipient"
  } else if (subject.length === 0) {
      if (confirm('Send without a subject?')){
        completeSend = true
      } else {
        completeSend = false
      }
  } else if (body.length === 0) {
      if (confirm('Send a blank email?')){
        completeSend = true
      } else {
        completeSend = false
      }
  }
  console.log(`Complete Send: ${completeSend}`)
 
  // Send mail if valid
  if (completeSend) {
    // send the data
    fetch('/emails', {
      method: 'POST', 
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
    });

    load_mailbox('sent') 
  } else if (msg.length > 0 ){
    alert(msg)
  } else {
    alert("Something went wrong. Please try again")
  }
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}