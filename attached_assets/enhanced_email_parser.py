import re
import json
import os
from datetime import datetime

class EnhancedEmailParser:
    """
    Enhanced email parser with support for advanced personalization variables.
    """
    
    def __init__(self):
        self.variable_pattern = r'([{]{1,2})([a-zA-Z0-9_\.]+)([}]{1,2})'
        self.variable_regex = re.compile(self.variable_pattern)
        
    def parse_recipient_line(self, line):
        """
        Parse a recipient line with optional custom fields.
        Format:
        - Simple format: email@example.com
        - Advanced format: email@example.com|firstname=John|lastname=Doe|company=Acme Inc|position=CEO
        
        Returns a dictionary with all available variables.
        """
        parts = line.strip().split('|')
        email = parts[0]
        
        # Initialize with basic email parts
        try:
            emailname, domain = email.split('@', 1)
        except ValueError:
            emailname = "user"
            domain = "example.com"
            
        # Split domain to get domain name without TLD
        domain_parts = domain.split('.')
        domain_name = domain_parts[0] if domain_parts else ''
        
        # Create base variables dictionary
        variables = {
            "email": email,
            "recipient_email": email,
            "emailname": emailname,
            "domain": domain_name,  # Modified: domain without TLD
            "full_domain": domain,  # Added: full domain with TLD
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "date": datetime.now().strftime("%Y-%m-%d"),
            "day": datetime.now().strftime("%A"),
            "month": datetime.now().strftime("%B"),
            "year": datetime.now().strftime("%Y"),
            "firstname": emailname.split('.')[0].title() if '.' in emailname else emailname.title(),
            "lastname": emailname.split('.')[1].title() if '.' in emailname else "",
            "company": domain_name.title(),  # Modified: Enhanced company derivation
            "random_number": str(hash(email) % 1000).zfill(3),
            "unsubscribe": f"https://example.com/unsubscribe?email={email}"
        }
        
        # Parse custom fields if available (after the | character)
        if len(parts) > 1:
            for part in parts[1:]:
                if "=" in part:
                    key, value = part.split('=', 1)
                    variables[key.strip().lower()] = value.strip()
        
        return variables
    
    def apply_enhanced_mail_merge(self, template, recipient_line):
        """
        Apply mail merge to a template with both single and double brace formats.
        Supports dynamic variable detection and replacement.
        
        Args:
            template: The email template string
            recipient_line: A line from the recipients file with optional custom fields
            
        Returns:
            The personalized template with all variables replaced
        """
        if not template:
            return template
            
        # Parse the recipient line
        variables = self.parse_recipient_line(recipient_line)
        
        # Find all variables in the template
        matches = self.variable_regex.findall(template)
        
        # Create replacements dictionary with both single and double braces
        replacements = {}
        
        for prefix, var_name, suffix in matches:
            # Skip if already processed
            key = f"{prefix}{var_name}{suffix}"
            if key in replacements:
                continue
                
            # Get variable value (use empty string if not found)
            value = variables.get(var_name.lower(), "")
            replacements[key] = value
        
        # Apply all replacements to the template
        result = template
        for pattern, replacement in replacements.items():
            result = result.replace(pattern, replacement)
        
        return result
    
    def get_available_variables(self):
        """
        Returns a list of all available standard variables that can be used in templates.
        """
        return [
            {"name": "email", "description": "Full email address of recipient", "example": "john.doe@example.com"},
            {"name": "recipient_email", "description": "Same as email", "example": "john.doe@example.com"},
            {"name": "emailname", "description": "Username part of email address", "example": "john.doe"},
            {"name": "domain", "description": "Domain name without TLD (e.g. 'example' from 'example.com')", "example": "example"},
            {"name": "full_domain", "description": "Complete domain part of email address with TLD", "example": "example.com"},
            {"name": "time", "description": "Current date and time", "example": "2025-04-18 14:30:45"},
            {"name": "date", "description": "Current date", "example": "2025-04-18"},
            {"name": "day", "description": "Current day of week", "example": "Friday"},
            {"name": "month", "description": "Current month", "example": "April"},
            {"name": "year", "description": "Current year", "example": "2025"},
            {"name": "firstname", "description": "First name (derived from email or custom field)", "example": "John"},
            {"name": "lastname", "description": "Last name (derived from email or custom field)", "example": "Doe"},
            {"name": "company", "description": "Company name (derived from domain name or custom field)", "example": "Example"},
            {"name": "random_number", "description": "Unique 3-digit number based on email", "example": "123"},
            {"name": "unsubscribe", "description": "Unsubscribe link with email parameter", "example": "https://example.com/unsubscribe?email=john.doe@example.com"},
            {"name": "Custom fields", "description": "Any custom field added with format email@example.com|fieldname=value", "example": "position, company, phone, etc."}
        ]
    
    def generate_documentation(self):
        """
        Generates HTML documentation for all available variables.
        """
        variables = self.get_available_variables()
        html = "<h2>Available Personalization Variables</h2>"
        html += "<p>Use these variables in your email templates with either single braces {variable} or double braces {{variable}}.</p>"
        html += "<table border='1' cellpadding='5' cellspacing='0'>"
        html += "<tr><th>Variable</th><th>Description</th><th>Example</th></tr>"
        
        for var in variables:
            html += f"<tr><td><code>{{{var['name']}}}</code></td><td>{var['description']}</td><td>{var['example']}</td></tr>"
        
        html += "</table>"
        html += "<h3>Advanced Recipient Format</h3>"
        html += "<p>To include custom fields, format your recipients file as follows:</p>"
        html += "<pre>email@example.com|firstname=John|lastname=Doe|company=Acme Inc|position=CEO</pre>"
        html += "<p>Then you can use {firstname}, {lastname}, {company}, and {position} variables in your templates.</p>"
        
        return html
        
if __name__ == "__main__":
    import argparse
    import sys
    import json
    
    # Set up command-line arguments
    cmd_parser = argparse.ArgumentParser(description='Enhanced Email Parser with advanced personalization')
    
    # Create a group for main commands
    group = cmd_parser.add_mutually_exclusive_group()
    group.add_argument('--apply-merge', action='store_true', help='Apply mail merge to a template')
    group.add_argument('--parse-recipient', action='store_true', help='Parse a recipient line')
    group.add_argument('--get-variables', action='store_true', help='Get available variables as JSON')
    group.add_argument('--generate-docs', action='store_true', help='Generate HTML documentation')
    
    # Template and recipient options
    cmd_parser.add_argument('--template', help='Path to template file for mail merge')
    cmd_parser.add_argument('--recipient', help='Path to recipient file for mail merge')
    cmd_parser.add_argument('--recipient-line', help='Direct recipient line string')
    
    # Parse arguments
    args = cmd_parser.parse_args()
    
    # Initialize parser
    parser = EnhancedEmailParser()
    
    # Process commands
    if args.get_variables:
        # Output available variables as JSON
        variables = parser.get_available_variables()
        print(json.dumps(variables))
        sys.exit(0)
        
    elif args.generate_docs:
        # Generate HTML documentation
        docs = parser.generate_documentation()
        print(docs)
        sys.exit(0)
        
    elif args.parse_recipient:
        if not args.recipient_line:
            print("Error: --recipient-line is required for --parse-recipient", file=sys.stderr)
            sys.exit(1)
            
        # Parse recipient line and output as JSON
        variables = parser.parse_recipient_line(args.recipient_line)
        print(json.dumps(variables))
        sys.exit(0)
        
    elif args.apply_merge:
        if not args.template or not args.recipient:
            print("Error: --template and --recipient are required for --apply-merge", file=sys.stderr)
            sys.exit(1)
            
        # Read template and recipient files
        try:
            with open(args.template, 'r') as template_file:
                template = template_file.read()
                
            with open(args.recipient, 'r') as recipient_file:
                recipient = recipient_file.read().strip()
                
            # Apply mail merge
            result = parser.apply_enhanced_mail_merge(template, recipient)
            print(result)
            sys.exit(0)
        except Exception as e:
            print(f"Error: {str(e)}", file=sys.stderr)
            sys.exit(1)
    
    else:
        # If no command specified, run example
        template = """
        <html>
        <body>
            <h1>Hello, {firstname} {lastname}!</h1>
            <p>We noticed you are the {position} at {company}.</p>
            <p>Your email is {email} and today is {day}, {date}.</p>
            <p>Your unique identifier is {random_number}.</p>
            <hr>
            <p>If you wish to unsubscribe, <a href="{unsubscribe}">click here</a>.</p>
        </body>
        </html>
        """
        
        # Example recipient with custom fields
        recipient = "john.doe@acme.com|firstname=John|lastname=Doe|position=CEO|industry=Technology"
        
        personalized = parser.apply_enhanced_mail_merge(template, recipient)
        print("Personalized email:")
        print(personalized)
        
        # Generate documentation
        print("\nDocumentation:")
        print(parser.generate_documentation())