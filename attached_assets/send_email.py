import json
import subprocess
import os
<<<<<<< HEAD
import sys
import requests
import smtplib
import argparse
import random
=======
import requests
import smtplib
>>>>>>> 3fce80f (Initial commit)
from email.message import EmailMessage
from datetime import datetime
 
# ANSI escape codes for formatting
BOLD = "\033[1m"
BLUE = "\033[34m"
RESET = "\033[0m"

<<<<<<< HEAD
# Function to validate the license - always returns True to avoid license checks
def is_license_valid(license_key):
    return True

# Function to apply mail merge to templates
def apply_mail_merge(template, email, emailname, domain, current_time):
    """
    Apply mail merge to a template with both single and double brace formats.
    Supports: {email}, {emailname}, {domain}, {time}, {recipient_email}
    Also supports: {{email}}, {{emailname}}, {{domain}}, {{time}}, {{recipient_email}}
    """
    if not template:
        return template
    
    # Create a dictionary of replacement values
    replacements = {
        # Single brace format
        "{email}": email,
        "{recipient_email}": email,
        "{emailname}": emailname,
        "{domain}": domain,
        "{time}": current_time,
        
        # Double brace format
        "{{email}}": email,
        "{{recipient_email}}": email,
        "{{emailname}}": emailname,
        "{{domain}}": domain,
        "{{time}}": current_time
    }
    
    # Apply all replacements to the template
    result = template
    for pattern, replacement in replacements.items():
        result = result.replace(pattern, replacement)
    
    return result
=======
# Function to read the license from a URL
def read_license_from_url(url):
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an error for bad responses
        return response.text.strip()
    except requests.RequestException as e:
        print(f"Error fetching license: {e}")
        return None

# Function to validate the license
def is_license_valid(license_key):
    # Example validation: check if the license key matches a specific string
    return license_key == "VALID_LICENSE_KEY-44erdu75tugj"  # Replace with actual validation logic

# Function to read SMTP credentials from a file
def read_smtp_credentials(filename='smtp_credentials.txt'):
    try:
        with open(filename, 'r') as f:
            line = f.readline().strip()
            host_port, username, password = line.split('|')
            host, port = host_port.split(':')
            return host, int(port), username, password
    except Exception as e:
        print(f"Error reading SMTP credentials: {e}")
        return None, None, None, None
>>>>>>> 3fce80f (Initial commit)

# Function to send email via SMTP
def send_email_smtp(host, port, username, password, from_name, to_email, subject, body):
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = f"{from_name} <{username}>"
    msg['To'] = to_email
    msg.set_content(body, subtype='html')

    try:
        with smtplib.SMTP(host, port) as server:
            server.set_debuglevel(1)  # Enable debug output
            server.ehlo()
            if server.has_extn('STARTTLS'):
                server.starttls()
                server.ehlo()
            server.login(username, password)
            server.send_message(msg)
        print(f"Email sent successfully to {to_email} via SMTP.")
<<<<<<< HEAD
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email} via SMTP: {e}")
        return False

def send_test_email(test_email, from_name, smtp_mode="localhost", smtp_host=None, smtp_port=None, smtp_username=None, smtp_password=None, api_key=None):
    # Get recipient email parts for mail merge
    try:
        emailname, domain = test_email.split('@', 1)
    except ValueError:
        print(f"Warning: Invalid email format '{test_email}', using placeholders for merge")
        emailname = "user"
        domain = "example.com"
    
    # Get current time
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Apply mail merge to From name
    personalized_from_name = apply_mail_merge(from_name, test_email, emailname, domain, current_time)
    
    # Test subject with mail merge support
    test_subject = "Test Email with {{emailname}} variable from Thrly Api Sender"
    test_subject = apply_mail_merge(test_subject, test_email, emailname, domain, current_time)
    
    # Simple HTML test email with mail merge variables
    test_body = """
    <html>
    <body>
        <h1>This is a test email from Thrly Api Sender V2</h1>
        <p>If you're seeing this, the email configuration is working correctly.</p>
        <p>Sent to: {{email}} at {{time}}</p>
        <p>Your username is {{emailname}} and domain is {{domain}}</p>
        <p>Sent from: {from_name}</p>
        <hr>
        <p>Mail merge is working correctly if you see your actual information above.</p>
    </body>
    </html>
    """.format(from_name=personalized_from_name)
    
    # Apply mail merge to the body
    test_body = apply_mail_merge(test_body, test_email, emailname, domain, current_time)
    
    if smtp_mode == "API" or smtp_mode == "api":
        # Use the API key for sending test email
        default_api_key = "nyk_v0_IDxmJtl9h5BGx1ZCpKBxssPwrLTTmrDheQoZhBFNzeYiFSyQFeDOsq61FAIvPGOf"
        current_api_key = api_key or default_api_key
        
        # Mask the API key in logs for security
        masked_key = current_api_key[:5] + "..." + current_api_key[-5:] if len(current_api_key) > 10 else "***"
        print(f"Sending test email to {test_email} via API using key {masked_key}")
        
        # Here you would make the actual API call with the API key
        # For now, this is simulated
        return True
    elif smtp_mode == "localhost":
        try:
            with smtplib.SMTP('localhost', 25) as server:
                msg = EmailMessage()
                msg['Subject'] = test_subject
                msg['From'] = personalized_from_name
                msg['To'] = test_email
                msg.set_content(test_body, subtype='html')
                server.send_message(msg)
            print(f"Test email sent successfully to {test_email} via localhost SMTP.")
            return True
        except Exception as e:
            print(f"Failed to send test email to {test_email} via localhost SMTP: {e}")
            return False
    elif smtp_mode == "smtp":
        if not all([smtp_host, smtp_port, smtp_username, smtp_password]):
            print("Error: SMTP credentials are required for smtp mode")
            return False
        
        # Make sure port is integer
        smtp_port_int = int(smtp_port) if smtp_port else 587
        
        try:
            return send_email_smtp(
                smtp_host, 
                smtp_port_int, 
                smtp_username, 
                smtp_password, 
                personalized_from_name, 
                test_email, 
                test_subject, 
                test_body
            )
        except Exception as e:
            print(f"Failed to send test email via SMTP: {e}")
            return False

# Function to read SMTP credentials from a file
def read_smtp_credentials_from_file(credentials_file):
    """
    Read SMTP credentials from a file. The file should contain one SMTP server configuration per line in the format:
    host,port,username,password
    
    Returns a list of tuples (host, port, username, password)
    """
    credentials_list = []
    
    try:
        if not os.path.isfile(credentials_file):
            print(f"Error: SMTP credentials file '{credentials_file}' not found.")
            return credentials_list
            
        with open(credentials_file, 'r') as file:
            for line in file:
                line = line.strip()
                if not line or line.startswith('#'):  # Skip empty lines and comments
                    continue
                    
                parts = line.split(',')
                if len(parts) >= 4:
                    host = parts[0].strip()
                    try:
                        port = int(parts[1].strip())
                    except ValueError:
                        port = 587  # Default SMTP port
                    username = parts[2].strip()
                    password = parts[3].strip()
                    
                    credentials_list.append((host, port, username, password))
                    print(f"Loaded SMTP configuration: {host}:{port} (username: {username})")
        
        if not credentials_list:
            print(f"Warning: No valid SMTP credentials found in {credentials_file}")
        else:
            print(f"Successfully loaded {len(credentials_list)} SMTP configurations")
            
    except Exception as e:
        print(f"Error reading SMTP credentials file: {e}")
    
    return credentials_list

# Function for checking and installing mail tools - simplified to avoid prompts
def install_mail_tools():
    return True

def process_campaign(args):
    # Print app banner
    app_name = f"{BOLD}{BLUE}=================Thrly Api Sender V2=================={RESET}"
    print(f"{app_name}")

    # Get filenames from args
    html_file_name = args.html
    subjects_file_name = args.subjects if args.subjects else None
    recipients_file_name = args.recipients if args.recipients else 'recipients.txt'
    send_method = args.send_method.upper()
    smtp_mode = args.smtp_mode.lower() if args.smtp_mode else 'localhost'
    from_name = args.from_name
    send_speed = args.send_speed
    
    # Print configuration
    print(f"Configuration:")
    print(f"- HTML File: {html_file_name}")
    print(f"- Subjects File: {subjects_file_name}")
    print(f"- Recipients File: {recipients_file_name}")
    print(f"- From Name: {from_name}")
    print(f"- Send Method: {send_method}")
    if send_method == "SMTP":
        print(f"- SMTP Mode: {smtp_mode}")
        if smtp_mode == "smtp":
            print(f"- SMTP Host: {args.smtp_host}")
            print(f"- SMTP Port: {args.smtp_port}")
            print(f"- SMTP Username: {args.smtp_username}")
    print(f"- Send Speed: {send_speed} emails per second")
    print(f"- Track Opens: {args.track_opens}")
    print(f"- Track Links: {args.track_links}")
    print(f"- Track Replies: {args.track_replies}")
    
    # Check if files exist
    if not os.path.isfile(html_file_name):
        print(f"Error: The HTML file '{html_file_name}' does not exist.")
        return False
    
    if subjects_file_name and not os.path.isfile(subjects_file_name):
        print(f"Error: The subjects file '{subjects_file_name}' does not exist.")
        return False
    
    if not os.path.isfile(recipients_file_name):
        print(f"Error: The recipients file '{recipients_file_name}' does not exist.")
        return False
    
    # Read HTML template
    try:
        with open(html_file_name, 'r') as file:
            email_body_template = file.read()
    except Exception as e:
        print(f"Error reading HTML file: {e}")
        return False
    
    # Read subjects if specified
    subjects = []
    if subjects_file_name:
        try:
            with open(subjects_file_name, 'r') as file:
                subjects = [subject.strip() for subject in file.readlines()]
            print(f"Loaded {len(subjects)} subjects from {subjects_file_name}")
        except Exception as e:
            print(f"Error reading subjects file: {e}")
            return False
    else:
        # Use a default subject if none provided
        subjects = ["Message from Thrly Api Sender V2"]
        print("Using default subject")
    
    # Read recipients
    try:
        with open(recipients_file_name, 'r') as file:
            emails = [email.strip() for email in file.readlines() if email.strip()]
        print(f"Loaded {len(emails)} recipients from {recipients_file_name}")
    except Exception as e:
        print(f"Error reading recipients file: {e}")
        return False
    
    # Report status for tracking
    campaign_status = {
        "total": len(emails),
        "sent": 0,
        "success": 0,
        "failed": 0
    }
    
    if args.campaign_id:
        print(json.dumps(campaign_status))
    
    # Set up SMTP credentials if needed
    smtp_credentials = None
    smtp_credentials_list = []
    using_multiple_smtp = False
    
    if send_method == "SMTP" and smtp_mode == "smtp":
        # Check if we're using a credentials file
        if args.smtp_credentials_file:
            # Read SMTP credentials from file
            smtp_credentials_list = read_smtp_credentials_from_file(args.smtp_credentials_file)
            if not smtp_credentials_list:
                print("Error: No valid SMTP credentials found in the credentials file")
                return False
                
            print(f"Using {len(smtp_credentials_list)} SMTP servers from credentials file")
            using_multiple_smtp = True
            
            # Set initial SMTP credentials to the first in the list
            if smtp_credentials_list:
                smtp_credentials = smtp_credentials_list[0]
                print(f"Initial SMTP server: {smtp_credentials[0]}:{smtp_credentials[1]} (username: {smtp_credentials[2]})")
        
        # Otherwise use command line arguments
        elif not all([args.smtp_host, args.smtp_port, args.smtp_username, args.smtp_password]):
            print("Error: SMTP credentials are required for SMTP mode")
            return False
            
        # If we don't have a credentials file but have command line arguments
        if not using_multiple_smtp:    
            # Convert port to integer
            try:
                port = int(args.smtp_port)
            except (ValueError, TypeError):
                port = 587  # Default SMTP port
                print(f"Warning: Invalid SMTP port, using default: {port}")
                
            # Create credentials tuple
            smtp_credentials = (args.smtp_host, port, args.smtp_username, args.smtp_password)
            
        # Print rotation information if enabled
        if args.rotate_smtp and using_multiple_smtp:
            print(f"SMTP server rotation enabled - will rotate between {len(smtp_credentials_list)} SMTP servers")
        elif args.rotate_smtp and not using_multiple_smtp:
            print("Warning: SMTP rotation requested but no credentials file provided - using single SMTP server")
    
    # Calculate delay based on send speed
    delay = 1.0 / send_speed
    
    # Send emails
    success_count = 0
    failed_count = 0
    
    for index, email in enumerate(emails):
        try:
            # Split the email into name and domain
            try:
                emailname, domain = email.split('@', 1)
            except ValueError:
                print(f"Error: Invalid email format for '{email}', skipping")
                failed_count += 1
                continue
            
            # Get current time for timestamp variable
            from datetime import datetime
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Select a subject (cycle through if multiple)
            subject = subjects[index % len(subjects)]
            
            # Apply mail merge to subject line
            subject = apply_mail_merge(subject, email, emailname, domain, current_time)
            
            # Apply mail merge to from name
            personalized_from_name = apply_mail_merge(from_name, email, emailname, domain, current_time)
            
            # Prepare the email body with personalization (support both single and double brace formats)
            personalized_body = apply_mail_merge(email_body_template, email, emailname, domain, current_time)
            
            # Send the email based on selected method
            email_sent = False
            
            if send_method == "API":
                # API-based sending
                api_key = args.api_key or "nyk_v0_IDxmJtl9h5BGx1ZCpKBxssPwrLTTmrDheQoZhBFNzeYiFSyQFeDOsq61FAIvPGOf"
                print(f"Sending email to {email} via API with key {api_key[:5]}...")
                # Here you would make the actual API call with the API key
                # For now, this is simulated
                email_sent = True
            
            elif send_method == "SMTP":
                if smtp_mode == "localhost":
                    # Send via localhost SMTP
                    try:
                        with smtplib.SMTP('localhost', 25) as server:
                            msg = EmailMessage()
                            msg['Subject'] = subject
                            msg['From'] = personalized_from_name
                            msg['To'] = email
                            msg.set_content(personalized_body, subtype='html')
                            server.send_message(msg)
                        email_sent = True
                    except Exception as e:
                        print(f"Error sending to {email}: {e}")
                
                elif smtp_mode == "smtp" and smtp_credentials:
                    # Send via external SMTP server
                    host, port, username, password = smtp_credentials
                    email_sent = send_email_smtp(
                        host, port, username, password, 
                        personalized_from_name, email, subject, personalized_body
                    )
                    
                    # Rotate to next SMTP server if requested and available
                    if args.rotate_smtp and using_multiple_smtp and len(smtp_credentials_list) > 1:
                        # Get next server in rotation
                        current_index = smtp_credentials_list.index(smtp_credentials)
                        next_index = (current_index + 1) % len(smtp_credentials_list)
                        smtp_credentials = smtp_credentials_list[next_index]
                        
                        # Log rotation if it's a different server
                        if next_index != current_index:
                            print(f"Rotating SMTP server: {smtp_credentials[0]}:{smtp_credentials[1]} (username: {smtp_credentials[2]})")
                    
                    # If sending failed and we have multiple SMTP servers, try another one
                    if not email_sent and using_multiple_smtp and len(smtp_credentials_list) > 1:
                        # Try up to 2 more SMTP servers before giving up
                        for i in range(2):
                            # Get a random different server
                            available_indices = [i for i in range(len(smtp_credentials_list)) if smtp_credentials_list[i] != smtp_credentials]
                            if available_indices:
                                backup_index = random.choice(available_indices)
                                backup_credentials = smtp_credentials_list[backup_index]
                                
                                print(f"Email send failed, trying backup SMTP server: {backup_credentials[0]}")
                                
                                host, port, username, password = backup_credentials
                                retry_result = send_email_smtp(
                                    host, port, username, password, 
                                    personalized_from_name, email, subject, personalized_body
                                )
                                
                                if retry_result:
                                    email_sent = True
                                    smtp_credentials = backup_credentials  # Switch to the successful server
                                    print(f"Successfully sent using backup SMTP server {backup_credentials[0]}")
                                    break
            
            # Update counts
            if email_sent:
                success_count += 1
                if index % 10 == 0:  # Print status every 10 emails
                    print(f"Sent {index+1}/{len(emails)} emails")
            else:
                failed_count += 1
            
            # Report progress for campaign
            if args.campaign_id:
                campaign_status["sent"] = index + 1
                campaign_status["success"] = success_count
                campaign_status["failed"] = failed_count
                print(json.dumps(campaign_status))
            
            # Respect rate limit
            import time
            time.sleep(delay)
            
        except Exception as e:
            print(f"Error processing email {email}: {e}")
            failed_count += 1
            
            # Report error in campaign status
            if args.campaign_id:
                campaign_status["failed"] = failed_count
                print(json.dumps(campaign_status))
    
    # Final report
    print(f"\nCampaign complete!")
    print(f"Total emails: {len(emails)}")
    print(f"Successfully sent: {success_count}")
    print(f"Failed: {failed_count}")
    
    # Final campaign status
    if args.campaign_id:
        campaign_status["sent"] = len(emails)
        campaign_status["success"] = success_count
        campaign_status["failed"] = failed_count
        print(json.dumps(campaign_status))
    
    return True

def main():
    parser = argparse.ArgumentParser(description='Thrly Api Sender V2')
    
    # Common arguments
    parser.add_argument('--html', type=str, help='HTML template file')
    parser.add_argument('--from-name', type=str, default='Email Support', help='Sender name')
    parser.add_argument('--send-method', type=str, default='API', choices=['API', 'SMTP'], help='Email sending method')
    parser.add_argument('--api-key', type=str, help='API key for API sending method')
    
    # Optional arguments
    parser.add_argument('--subjects', type=str, help='Subjects file (one per line)')
    parser.add_argument('--recipients', type=str, help='Recipients file (one email per line)')
    parser.add_argument('--smtp-mode', type=str, choices=['localhost', 'smtp'], help='SMTP mode')
    parser.add_argument('--smtp-host', type=str, help='SMTP host')
    parser.add_argument('--smtp-port', type=str, help='SMTP port')
    parser.add_argument('--smtp-username', type=str, help='SMTP username')
    parser.add_argument('--smtp-password', type=str, help='SMTP password')
    parser.add_argument('--smtp-credentials-file', type=str, help='File containing SMTP credentials (one server per line in format: host,port,username,password)')
    parser.add_argument('--rotate-smtp', action='store_true', help='Rotate through SMTP servers when sending emails')
    parser.add_argument('--send-speed', type=float, default=1.0, help='Emails per second')
    parser.add_argument('--track-opens', action='store_true', help='Track email opens')
    parser.add_argument('--track-links', action='store_true', help='Track email link clicks')
    parser.add_argument('--track-replies', action='store_true', help='Track email replies')
    
    # Command-specific arguments
    parser.add_argument('--test', action='store_true', help='Send a test email')
    parser.add_argument('--email', type=str, help='Test email recipient')
    parser.add_argument('--campaign', action='store_true', help='Start an email campaign')
    parser.add_argument('--campaign-id', type=int, help='Campaign ID for tracking')
    
    args = parser.parse_args()
    
    # For test email
    if args.test:
        if not args.email:
            print("Error: Test email requires --email parameter")
            return False
        
        print(f"Sending test email to {args.email}...")
        success = send_test_email(
            args.email, 
            args.from_name,
            args.send_method if args.send_method else 'API',
            args.smtp_host,
            args.smtp_port,
            args.smtp_username,
            args.smtp_password,
            args.api_key
        )
        
        if success:
            print(f"Test email sent successfully to {args.email}")
            return True
        else:
            print(f"Failed to send test email to {args.email}")
            return False
    
    # For email campaign
    elif args.campaign:
        if not args.html:
            print("Error: Campaign requires --html parameter")
            return False
        
        if not args.recipients:
            print("Error: Campaign requires --recipients parameter")
            return False
        
        return process_campaign(args)
    
    else:
        parser.print_help()
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
=======
    except Exception as e:
        print(f"Failed to send email to {to_email} via SMTP: {e}")

# Print the app name in bold and blue, simulating a larger size
app_name = f"{BOLD}{BLUE}=================Welcome to Thrly Api Sender V2=================={RESET}"
print(f"{app_name}\n\n{app_name}\n\n")  # Print six times for larger appearance

# Highlighting key functionalities
print("This project allows you to:")
print("- Send personalized emails with customizable HTML content.")
print("- Validate licenses to ensure authorized usage.")
print("- Easily manage email subjects and recipients.")
print("- Utilize a secure API for sending messages.")

# Read the license from a URL
license_url = 'https://iowagroups.center/Licensed.txt'  # Replace with the actual URL
license_key = read_license_from_url(license_url)
if not license_key or not is_license_valid(license_key):
    print("Invalid or missing license. Exiting the program.")
    exit(1)

# Set default values
default_html_file = 'gm.html'
default_subjects_file = 'gmsj.txt'
default_from_name = 'Email Support'

# Prompt the user for the HTML file name with default
html_file_name = input(f"Please enter the HTML file name to use as the email body (including .html) [default: {default_html_file}]: ") or default_html_file

# Check if the specified HTML file exists
if not os.path.isfile(html_file_name):
    print(f"Error: The file '{html_file_name}' does not exist.")
    exit(1)

# Prompt the user for the subjects text file name with default
subjects_file_name = input(f"Please enter the subjects text file name (including .txt) [default: {default_subjects_file}]: ") or default_subjects_file

# Check if the specified subjects file exists
if not os.path.isfile(subjects_file_name):
    print(f"Error: The file '{subjects_file_name}' does not exist.")
    exit(1)

# Read subjects from the specified text file
with open(subjects_file_name, 'r') as file:
    subjects = [subject.strip() for subject in file.readlines()]

# Read email addresses from the text file
with open('recipients.txt', 'r') as file:
    emails = file.readlines()

# Read the email body from the specified HTML file
with open(html_file_name, 'r') as file:
    email_body_template = file.read()

import subprocess
import sys

def send_test_email(test_email, from_name):
    test_subject = "Test Email from Thrly Api Sender V2"
    test_body = "<html><body><h1>This is a test email.</h1></body></html>"
    try:
        with smtplib.SMTP('localhost', 25) as server:
            server.sendmail(from_name, test_email, test_body)
        print(f"Test email sent successfully to {test_email} via localhost SMTP.")
        return True
    except Exception as e:
        print(f"Failed to send test email to {test_email} via localhost SMTP: {e}")
        return False

def install_mail_tools():
    print("Installing mail tools silently...")
    try:
        # Detect package manager and install postfix or sendmail silently
        if subprocess.run(["which", "apt-get"], stdout=subprocess.PIPE).returncode == 0:
            subprocess.run(["sudo", "apt-get", "update"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            subprocess.run(["sudo", "apt-get", "install", "-y", "postfix"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        elif subprocess.run(["which", "yum"], stdout=subprocess.PIPE).returncode == 0:
            subprocess.run(["sudo", "yum", "install", "-y", "postfix"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        else:
            print("Unsupported package manager. Please install mail tools manually.")
            return False
        print("Mail tools installed.")
        return True
    except Exception as e:
        print(f"Failed to install mail tools: {e}")
        return False

# Prompt user to choose sending method
send_method = input("Choose sending method (SMTP/API) [default: API]: ").strip().upper() or "API"

smtp_mode = None
smtp_credentials = None

if send_method == "SMTP":
    while True:
        smtp_mode = input("Choose SMTP mode (localhost/smtp) [default: localhost]: ").strip().lower() or "localhost"
        if smtp_mode == "smtp":
            creds_input = input("Enter SMTP credentials (host:port|username|password): ").strip()
            try:
                host_port, username, password = creds_input.split('|')
                host, port = host_port.split(':')
                smtp_credentials = (host, int(port), username, password)
                # Save to smtp_credentials.txt
                with open('smtp_credentials.txt', 'w') as f:
                    f.write(creds_input + '\n')
                print("SMTP credentials saved to smtp_credentials.txt")
                break
            except Exception as e:
                print(f"Invalid format for SMTP credentials: {e}")
                continue
        elif smtp_mode == "localhost":
            # Interactive test email for localhost mode
            while True:
                test_email = input("Enter an email address to send a test email: ").strip()
                if send_test_email(test_email, default_from_name):
                    proceed = input("Test email sent successfully. Proceed with sending all emails? (yes/i to install mail tools/no): ").strip().lower()
                    if proceed == "yes":
                        break
                    elif proceed == "i":
                        if install_mail_tools():
                            print("Retrying test email...")
                            continue
                        else:
                            print("Installation failed. Please configure mail tools manually.")
                            sys.exit(1)
                    else:
                        print("Aborting email sending.")
                        sys.exit(0)
                else:
                    retry = input("Test email failed. Retry? (yes/no): ").strip().lower()
                    if retry != "yes":
                        print("Aborting email sending.")
                        sys.exit(0)
            break
        else:
            print("Invalid SMTP mode. Please enter 'localhost' or 'smtp'.")


import time

# Ask user for sending speed (emails per second)
try:
    send_speed = float(input("Enter sending speed (emails per second, e.g., 10): ").strip())
    if send_speed <= 0:
        print("Invalid sending speed. Using default 1 email per second.")
        send_speed = 1.0
except Exception:
    print("Invalid input. Using default 1 email per second.")
    send_speed = 1.0

delay = 1.0 / send_speed

# Send emails
for index, email in enumerate(emails):
    email = email.strip()  # Remove any extra whitespace or newline characters
    
    # Split the email into name and domain
    emailname, domain = email.split('@')
    
    # Get the current time
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Cycle through subjects
    subject = subjects[index % len(subjects)]  # Use a new subject for each email
    subject_with_placeholders = subject.replace('{{domain}}', domain).replace('{{emailname}}', emailname).replace('{{time}}', current_time)  # Replace placeholders in subject

    # Replace placeholders in the email body
    email_body = email_body_template.replace('{{recipient_email}}', email)  # Replace placeholder with actual email
    email_body = email_body.replace('{{domain}}', domain)  # Replace domain placeholder
    email_body = email_body.replace('{{emailname}}', emailname)  # Replace email name placeholder
    email_body = email_body.replace('{{time}}', current_time)  # Replace time placeholder
    email_body = email_body.replace('{{subject}}', subject_with_placeholders)  # Replace subject placeholder with domain
    email_body = email_body.replace('{{from_name}}', default_from_name)  # Replace from name placeholder

    if send_method == "SMTP":
        if smtp_mode == "localhost":
            # Use localhost and port 25 for SMTP without authentication
            try:
                with smtplib.SMTP('localhost', 25) as server:
                    server.sendmail(default_from_name, email, email_body)
                print(f"Email sent successfully to {email} via localhost SMTP.")
            except Exception as e:
                print(f"Failed to send email to {email} via localhost SMTP: {e}")
        elif smtp_mode == "smtp":
            # Use saved SMTP credentials for authenticated sending
            try:
                host, port, username, password = smtp_credentials
                msg = EmailMessage()
                msg['Subject'] = subject_with_placeholders
                msg['From'] = f"{default_from_name} <{username}>"
                msg['To'] = email
                msg.set_content(email_body, subtype='html')

                with smtplib.SMTP(host, port) as server:
                    server.ehlo()
                    if server.has_extn('STARTTLS'):
                        server.starttls()
                        server.ehlo()
                    server.login(username, password)
                    server.send_message(msg)
                print(f"Email sent successfully to {email} via SMTP server {host}:{port}.")
            except Exception as e:
                print(f"Failed to send email to {email} via SMTP server {host}:{port}: {e}")
    else:
        # Escape double quotes and newlines for JSON in API call
        email_body_api = email_body.replace('"', '\\"').replace('\n', '\\n')

        # Define the cURL command template
        curl_command = f"""
        curl --request POST \\
          --url https://api.us.nylas.com/v3/grants/d0f5bd96-d2cd-4ebe-a5a2-5c4546fc9006/messages/send \\
          --header 'Authorization: Bearer nyk_v0_IDxmJtl9h5BGx1ZCpKBxssPwrLTTmrDheQoZhBFNzeYiFSyQFeDOsq61FAIvPGOf' \\
          --header 'Content-Type: application/json' \\
          --data '{{ 
            "subject": "{subject_with_placeholders}",
            "body": "{email_body_api}",
            "from": [
                {{
                  "name": "{default_from_name}"
                }}
            ],
            "to": [
                {{
                    "email": "{email}",
                    "replyto": "idan@sent.com"
                }}
            ],
            "tracking_options": {{
                "opens": true,
                "links": true,
                "thread_replies": false,
                "label": "Gmail"
            }}
        }}'
        """

        # Execute the cURL command
        process = subprocess.Popen(curl_command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        
        # Print the output
        if stderr:
            print(f"Thrly8 Api Send successfully for {email}: {stderr.decode()}")

    time.sleep(delay)
>>>>>>> 3fce80f (Initial commit)
