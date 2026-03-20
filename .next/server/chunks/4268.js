"use strict";exports.id=4268,exports.ids=[4268],exports.modules={64268:(e,t,r)=>{r.d(t,{EmailService:()=>c});let a={smtp:{host:process.env.NEXT_PUBLIC_SMTP_HOST||"smtp.hostinger.com",port:parseInt(process.env.NEXT_PUBLIC_SMTP_PORT||"465"),secure:"true"===process.env.NEXT_PUBLIC_SMTP_SECURE||!0,auth:{user:process.env.NEXT_PUBLIC_SMTP_USER||"",pass:process.env.NEXT_PUBLIC_SMTP_PASS||""}},imap:{host:process.env.NEXT_PUBLIC_IMAP_HOST||"imap.hostinger.com",port:parseInt(process.env.NEXT_PUBLIC_IMAP_PORT||"993"),secure:!0,auth:{user:process.env.NEXT_PUBLIC_IMAP_USER||"",pass:process.env.NEXT_PUBLIC_IMAP_PASS||""}},pop:{host:process.env.NEXT_PUBLIC_POP_HOST||"pop.hostinger.com",port:parseInt(process.env.NEXT_PUBLIC_POP_PORT||"995"),secure:!0,auth:{user:process.env.NEXT_PUBLIC_POP_USER||"",pass:process.env.NEXT_PUBLIC_POP_PASS||""}},from:{name:process.env.NEXT_PUBLIC_EMAIL_FROM_NAME||"Artistic Pro",email:process.env.NEXT_PUBLIC_EMAIL_FROM_EMAIL||""},replyTo:{name:process.env.NEXT_PUBLIC_EMAIL_REPLY_NAME||"Artistic Pro Support",email:process.env.NEXT_PUBLIC_EMAIL_REPLY_EMAIL||""},templates:{orderConfirmation:"order-confirmation",welcome:"welcome",passwordReset:"password-reset",emailVerification:"email-verification",newsletter:"newsletter",marketing:"marketing"},rateLimit:{maxEmailsPerHour:100,maxEmailsPerDay:1e3}},i=e=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);(function(e){e.ORDER_CONFIRMATION="order_confirmation",e.WELCOME="welcome",e.PASSWORD_RESET="password_reset",e.EMAIL_VERIFICATION="email_verification",e.NEWSLETTER="newsletter",e.MARKETING="marketing",e.ADMIN_NOTIFICATION="admin_notification",e.RETURN_REQUEST="return_request"})(s||(s={})),function(e){e.LOW="low",e.NORMAL="normal",e.HIGH="high",e.URGENT="urgent"}(o||(o={}));var s,o,n=r(96726),d=r(4587);let l={[s.ORDER_CONFIRMATION]:{subject:"Order Confirmation - {{orderId}}",html:`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ec4899, #be185d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ec4899; }
    .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .item:last-child { border-bottom: none; }
    .download-section { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .download-btn { display: inline-block; background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 5px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎨 Order Confirmed!</h1>
      <p>Thank you for your purchase, \${'{customerName}'}!</p>
    </div>
    <div class="content">
      <div class="order-details">
        <h2>Order Details</h2>
        <p><strong>Order ID:</strong> \${'{orderId}'}</p>
        <p><strong>Order Date:</strong> \${'{orderDate}'}</p>
        <p><strong>Total Amount:</strong> $\${'{totalAmount}'}</p>
      </div>
      
      <div class="order-details">
        <h2>Your Items</h2>
        \${'{items}'}
      </div>
      
      <div class="download-section">
        <h2>📥 Download Your Artwork</h2>
        <p>Click the links below to download your purchased artwork:</p>
        \${'{downloadLinks}'}
      </div>
      
      <div class="order-details">
        <h2>Need Help?</h2>
        <p>If you have any questions about your order, please don't hesitate to contact us.</p>
        <p>Email: support@artisticpro.com</p>
      </div>
    </div>
    <div class="footer">
      <p>\xa9 2024 Artistic Pro. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,text:`Order Confirmation - \${'{orderId}'}

Thank you for your purchase, \${'{customerName}'}!

Order Details:
- Order ID: \${'{orderId}'}
- Order Date: \${'{orderDate}'}
- Total Amount: $\${'{totalAmount}'}

Your Items:
\${'{itemsText}'}

Download Your Artwork:
\${'{downloadLinksText}'}

Need Help?
If you have any questions about your order, please contact us at support@artisticpro.com

\xa9 2024 Artistic Pro. All rights reserved.`},[s.WELCOME]:{subject:"Welcome to Artistic Pro! \uD83C\uDFA8",html:`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Artistic Pro</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ec4899, #be185d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .cta-button { display: inline-block; background: #ec4899; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎨 Welcome to Artistic Pro!</h1>
      <p>Your creative journey starts here</p>
    </div>
    <div class="content">
      <h2>Hello \${'{userName}'}!</h2>
      <p>Welcome to Artistic Pro, where creativity meets technology. We're thrilled to have you join our community of artists and art lovers.</p>
      
      <h3>What you can do:</h3>
      <ul>
        <li>✨ Browse our curated collection of digital artwork</li>
        <li>🛒 Purchase high-quality digital downloads</li>
        <li>👤 Create your personal art collection</li>
        <li>📧 Get notified about new releases</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="\${'{dashboardUrl}'}" class="cta-button">Explore Your Dashboard</a>
      </div>
      
      <p>If you have any questions, feel free to reach out to our support team.</p>
    </div>
    <div class="footer">
      <p>\xa9 2024 Artistic Pro. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`},[s.PASSWORD_RESET]:{subject:"Reset Your Password - Artistic Pro",html:`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ec4899, #be185d); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .reset-button { display: inline-block; background: #ec4899; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
    .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset Request</h1>
    </div>
    <div class="content">
      <h2>Hello \${'{userName}'},</h2>
      <p>We received a request to reset your password for your Artistic Pro account.</p>
      
      <div style="text-align: center;">
        <a href="\${'{resetUrl}'}" class="reset-button">Reset My Password</a>
      </div>
      
      <div class="warning">
        <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
      </div>
      
      <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
      
      <p>For security reasons, never share this link with anyone.</p>
    </div>
    <div class="footer">
      <p>\xa9 2024 Artistic Pro. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`},[s.RETURN_REQUEST]:{subject:"New Return Request - Order #{{orderId}}",html:`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Return Request Notification</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d9488, #14b8a6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .return-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0d9488; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    .info-row:last-child { border-bottom: none; }
    .label { font-weight: bold; color: #374151; }
    .value { color: #6b7280; }
    .action-btn { display: inline-block; background: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    .urgent { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔄 New Return Request</h1>
      <p>A customer has requested a return</p>
    </div>
    <div class="content">
      <div class="urgent">
        <strong>⚠️ Action Required:</strong> A customer has initiated a return request. Please review and process it promptly.
      </div>
      
      <div class="return-details">
        <h2>Return Request Details</h2>
        <div class="info-row">
          <span class="label">Return ID:</span>
          <span class="value">\${'{returnId}'}</span>
        </div>
        <div class="info-row">
          <span class="label">Order ID:</span>
          <span class="value">\${'{orderId}'}</span>
        </div>
        <div class="info-row">
          <span class="label">Customer Name:</span>
          <span class="value">\${'{customerName}'}</span>
        </div>
        <div class="info-row">
          <span class="label">Customer Email:</span>
          <span class="value">\${'{customerEmail}'}</span>
        </div>
        <div class="info-row">
          <span class="label">Request Date:</span>
          <span class="value">\${'{requestDate}'}</span>
        </div>
      </div>
      
      <div class="return-details">
        <h2>Product Information</h2>
        <div class="info-row">
          <span class="label">Product:</span>
          <span class="value">\${'{productTitle}'}</span>
        </div>
        <div class="info-row">
          <span class="label">Quantity:</span>
          <span class="value">\${'{quantity}'}</span>
        </div>
        <div class="info-row">
          <span class="label">Amount:</span>
          <span class="value">₹\${'{totalPrice}'}</span>
        </div>
      </div>
      
      <div class="return-details">
        <h2>Return Reason</h2>
        <p><strong>\${'{reason}'}</strong></p>
        <p style="color: #6b7280; margin-top: 10px;">\${'{customerNotes}'}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="\${'{adminUrl}'}" class="action-btn">Review Return Request</a>
      </div>
      
      <div class="return-details">
        <h2>Next Steps</h2>
        <ol style="color: #6b7280;">
          <li>Review the return request details</li>
          <li>Approve or reject the return</li>
          <li>Schedule pickup with Delhivery if approved</li>
          <li>Process refund once item is received</li>
        </ol>
      </div>
    </div>
    <div class="footer">
      <p>\xa9 2024 Lurevi. All rights reserved.</p>
      <p>This is an automated notification from your returns system.</p>
    </div>
  </div>
</body>
</html>`}};class c{static{this.emailQueue=[]}static{this.isProcessing=!1}static{this.rateLimitTracker={}}static async sendEmail(e){try{for(let t of Array.isArray(e.to)?e.to:[e.to])if(!i(t.email))return{success:!1,error:`Invalid email address: ${t.email}`,recipient:t.email};if(!this.checkRateLimit())return{success:!1,error:"Rate limit exceeded. Please try again later."};let t=await this.sendViaSMTP(e);return t.success&&this.updateRateLimit(),t}catch(e){return console.error("❌ Email sending failed:",e),{success:!1,error:e instanceof Error?e.message:"Unknown error occurred"}}}static async sendTemplateEmail(e,t,r,a){let i=l[e];if(!i)return{success:!1,error:`Template not found: ${e}`};let s=a||i.subject,n=i.html,d=i.text;for(let[e,t]of Object.entries(r)){let r=`\\$\\{'{${e}}'\\}`,a=String(t||"");s=s.replace(RegExp(r,"g"),a),n=n.replace(RegExp(r,"g"),a),d&&(d=d.replace(RegExp(r,"g"),a))}let c=n.match(/\\\$\\{'\{[^}]+\}'\\}/g);return c&&(console.warn("⚠️ Remaining placeholders found:",c),c.forEach(e=>{n=n.replace(RegExp(e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"),""),d&&(d=d.replace(RegExp(e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"g"),""))})),this.sendEmail({to:t,subject:s,html:n,text:d,priority:o.NORMAL})}static async sendOrderConfirmation(e,t,r){let a=r.items.map(e=>`
      <div class="item">
        <div>
          <strong>${e.title}</strong><br>
          <small>Quantity: ${e.quantity}</small>
        </div>
        <div>$${e.price}</div>
      </div>
    `).join(""),i=r.items.map(e=>`- ${e.title} (Qty: ${e.quantity}) - $${e.price}`).join("\n"),o=r.downloadLinks.map(e=>`<a href="${e}" class="download-btn">Download</a>`).join(""),n=r.downloadLinks.map((e,t)=>`${t+1}. ${e}`).join("\n");return this.sendTemplateEmail(s.ORDER_CONFIRMATION,{email:e,name:t},{customerName:t,orderId:r.orderId,orderDate:r.orderDate,totalAmount:r.totalAmount,items:a,itemsText:i,downloadLinks:o,downloadLinksText:n})}static async sendWelcomeEmail(e,t){return this.sendTemplateEmail(s.WELCOME,{email:e,name:t},{userName:t,dashboardUrl:`${window.location.origin}/dashboard`})}static async sendPasswordResetEmail(e,t,r){let a=`${window.location.origin}/reset-password?token=${r}`;return this.sendTemplateEmail(s.PASSWORD_RESET,{email:e,name:t},{userName:t,resetUrl:a})}static async sendReturnRequestNotification(e){let t=`${window.location.origin}/admin/returns`;return this.sendTemplateEmail(s.RETURN_REQUEST,{email:"returns@lurevi.in",name:"Returns Team"},{returnId:e.returnId,orderId:e.orderId,customerName:e.customerName,customerEmail:e.customerEmail,productTitle:e.productTitle,quantity:e.quantity.toString(),totalPrice:e.totalPrice.toFixed(2),reason:e.reason,customerNotes:e.customerNotes||"No additional notes provided",requestDate:e.requestDate,adminUrl:t},`New Return Request - Order #${e.orderId}`)}static async sendBulkEmails(e,t,r,a){let i=[];for(let s=0;s<e.length;s+=10){let n=e.slice(s,s+10).map(e=>this.sendEmail({to:e,subject:t,html:r,text:a,priority:o.LOW})),d=await Promise.all(n);i.push(...d),s+10<e.length&&await new Promise(e=>setTimeout(e,1e3))}return i}static async sendViaSMTP(e){let t=(Array.isArray(e.to)?e.to:[e.to])[0];try{let{data:r,error:i}=await d.supabase.functions.invoke("send-email",{body:{to:t.email,toName:t.name||"",subject:e.subject,html:e.html||"",text:e.text||"",replyTo:e.replyTo||a.replyTo.email||""}});if(i){if(i instanceof n.MF)try{let e=await i.context.json(),t=e?.error||e?.message||"Edge Function returned non-2xx response";return console.error("Edge Function HTTP error details:",e),{success:!1,error:t}}catch{return{success:!1,error:i.message||"Edge Function HTTP error"}}return console.error("Edge Function error:",i),{success:!1,error:i.message||"Edge Function call failed"}}if(r?.success)return{success:!0,messageId:r.messageId};return{success:!1,error:r?.error||"Unknown email error"}}catch(e){return console.error("Email send network error:",e),{success:!1,error:e instanceof Error?e.message:"Network error sending email"}}}static checkRateLimit(){let e=Date.now(),t=this.rateLimitTracker[`hour_${Math.floor(e/36e5)}`]||0,r=this.rateLimitTracker[`day_${Math.floor(e/864e5)}`]||0;return t<a.rateLimit.maxEmailsPerHour&&r<a.rateLimit.maxEmailsPerDay}static updateRateLimit(){let e=Date.now(),t=Math.floor(e/36e5),r=Math.floor(e/864e5);this.rateLimitTracker[`hour_${t}`]=(this.rateLimitTracker[`hour_${t}`]||0)+1,this.rateLimitTracker[`day_${r}`]=(this.rateLimitTracker[`day_${r}`]||0)+1,Object.keys(this.rateLimitTracker).forEach(t=>{Math.abs(e-parseInt(t.split("_")[1])*(t.startsWith("hour_")?36e5:864e5))>2*(t.startsWith("hour_")?36e5:864e5)&&delete this.rateLimitTracker[t]})}static getEmailStats(){let e=Date.now(),t=this.rateLimitTracker[`day_${Math.floor(e/864e5)}`]||0,r=this.rateLimitTracker[`hour_${Math.floor(e/36e5)}`]||0;return{sentToday:t,sentThisHour:r,rateLimitRemaining:{hourly:Math.max(0,a.rateLimit.maxEmailsPerHour-r),daily:Math.max(0,a.rateLimit.maxEmailsPerDay-t)}}}}}};