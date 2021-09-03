export const templates: {
  [key: string]: { SubjectPart: string; HtmlPart: string; TextPart: string };
} = {};

{% if totp %}
templates.totp = {
  SubjectPart: "{{ '{{Organization}}' }}: Your requested temporary code is {{ '{{OTP}}' }}",
  HtmlPart:
    "<h2>{{ '{{Organization}}' }}</h2><p>Copy and paste this temporary code:</p><pre>{{ '{{OTP}}' }}</pre><p>If you didn't request a code, you can safely ignore this email.</p>",
  TextPart:
    "Copy and paste this temporary code:\n\n{{ '{{OTP}}' }}\n\nIf you didn't request a code, you can safely ignore this email.\n\n{{ '{{Organization}}' }}",
};
{% endif %}