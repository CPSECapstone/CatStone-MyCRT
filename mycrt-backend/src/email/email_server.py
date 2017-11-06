import smtplib
from email.mime.text import MIMEText

EMAIL = "mycrtNotifications@gmail.com"
PASS = "myCRTTool"

def email(recipient, subject, body):
   s = smtplib.SMTP('smtp.gmail.com', port=587)

   msg = MIMEText(body)
   msg['Subject'] = subject
   msg['From'] = EMAIL
   msg['To'] = recipient

   try:
      s.ehlo()
      s.starttls()
      s.login(EMAIL, PASS)
      s.sendmail(EMAIL, recipient, msg.as_string())
      s.quit()
      return 0
   except:
      return 1

def main():
   email('aly16@calpoly.edu', 'Capture status: Complete', 'Your capture status was "Success"')

if __name__ == '__main__':
   main()   
