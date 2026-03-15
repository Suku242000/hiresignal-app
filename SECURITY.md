Reporting a Vulnerability
If you discover a security vulnerability in HireSignal, please follow these steps:
DO NOT open a public GitHub issue for security vulnerabilities.
How to Report

Email us at: sensukumar66@gmail.com
Include in your report:

Description of the vulnerability
Steps to reproduce
Potential impact
Any suggested fixes (optional)



What to Expect

We will acknowledge your report within 48 hours
We aim to resolve critical issues within 7 days
We will notify you when the fix is deployed
We credit responsible disclosure in our release notes

Security Best Practices for Users

Never share your Gemini or Anthropic API keys publicly
Never commit .env files to the repository
Always use environment variables for sensitive credentials
Rotate your API keys regularly at aistudio.google.com

Our Security Measures

All API keys are stored as encrypted environment variables
No user data is stored or logged
All AI requests are made server-side via secure proxy
Dependencies are regularly updated

Scope
The following are in scope for security reports:

API key exposure
Authentication bypass
Data leakage
XSS or injection vulnerabilities

The following are out of scope:

Theoretical vulnerabilities without proof of concept
Issues in third-party dependencies (report to them directly)
