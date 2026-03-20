"use strict";exports.id=160,exports.ids=[160],exports.modules={50160:(e,r,t)=>{t.d(r,{c:()=>s});var o=t(4587),a=t(40520),i=t(44667);class s{static async completeOrder(e){try{let r=await this.createOrderInDatabase(e);if(!r.success)return r;let t=r.orderId;if(e.items.some(e=>"poster"===e.selectedProductType||"clothing"===e.selectedProductType))try{await this.createDelhiveryShipment(e,t)}catch(e){console.error("⚠️ Failed to create Delhivery shipment (non-critical):",e)}let o=await this.getProductDetailsForEmail(e.items);if(!o.success)return{success:!1,error:o.error};let a=await this.generateSecureDownloadLinks(t,e.items);await this.updateOrderWithDownloadLinks(t,a);let i=await this.sendOrderConfirmationEmail({customerName:e.customerName,customerEmail:e.customerEmail,orderId:t,orderDate:new Date().toISOString(),totalAmount:e.totalAmount,items:o.items,downloadLinks:a});return await this.updateProductDownloadCounts(e.items),{success:!0,orderId:t,downloadLinks:a,emailSent:i.success}}catch(e){return console.error("❌ Order completion failed:",e),{success:!1,error:e instanceof Error?e.message:"Unknown error occurred"}}}static async createOrderInDatabase(e){try{let r=a.Z.getCurrencySettings().defaultCurrency,t=a.Z.getCurrency(r),i=t?.rate||1,s="completed",d=e.items.some(e=>"poster"===e.selectedProductType||"clothing"===e.selectedProductType);"cod"===e.paymentMethod?s="pending":d&&(s="processing");let{data:n,error:c}=await o.supabase.from("orders").insert({customer_id:e.customerId,customer_name:e.customerName,customer_email:e.customerEmail,customer_phone:e.customerPhone,total_amount:e.totalAmount,status:s,payment_method:e.paymentMethod,payment_id:e.paymentId,notes:e.notes,shipping_address:e.shippingAddress,currency_code:r,currency_rate:i}).select().single();if(c)return console.error("❌ Failed to create order:",c),{success:!1,error:`Failed to create order: ${c.message}`};let l=e.items.map(e=>({order_id:n.id,product_id:e.productId,product_title:e.productTitle,product_image:e.productImage,quantity:e.quantity,unit_price:e.unitPrice,total_price:e.totalPrice,selected_product_type:e.selectedProductType||"digital",selected_poster_size:e.selectedPosterSize||null,options:e.options||null,currency_code:r,currency_rate:i})),{error:u}=await o.supabase.from("order_items").insert(l);if(u)return console.error("❌ Failed to create order items:",u),{success:!1,error:`Failed to create order items: ${u.message}`};return{success:!0,orderId:n.id}}catch(e){return console.error("❌ Database error:",e),{success:!1,error:e instanceof Error?e.message:"Database error occurred"}}}static async getProductDetailsForEmail(e){try{let r=e.map(e=>e.productId),{data:t,error:a}=await o.supabase.from("products").select("id, title, price, main_image, pdf_url, product_type").in("id",r);if(a)return console.error("❌ Failed to fetch product details:",a),{success:!1,error:`Failed to fetch product details: ${a.message}`};let i=new Map(t.map(e=>[e.id,e])),s=e.map(e=>{let r=i.get(e.productId),t=r?.product_type==="digital";return{title:r?.title||e.productTitle,price:e.unitPrice,quantity:e.quantity,mainImage:t?r?.main_image:void 0,pdfUrl:t?r?.pdf_url:void 0}});return{success:!0,items:s}}catch(e){return console.error("❌ Error fetching product details:",e),{success:!1,error:e instanceof Error?e.message:"Error fetching product details"}}}static async generateSecureDownloadLinks(e,r){try{let t=[];for(let a of r){let{data:r}=await o.supabase.from("products").select("pdf_url").eq("id",a.productId).single();if(r?.pdf_url){let r=this.generateDownloadToken(e,a.productId),o=`${window.location.origin}/download/${a.productId}?token=${r}&order=${e}`;t.push(o)}}return t}catch(e){return console.error("❌ Error generating download links:",e),[]}}static generateDownloadToken(e,r){let t=Date.now(),o=Math.random().toString(36).substring(2,15);return`${e}_${r}_${t}_${o}`}static async updateOrderWithDownloadLinks(e,r){try{let{error:t}=await o.supabase.from("orders").update({download_links:r}).eq("id",e);if(t)throw console.error("❌ Failed to update order with download links:",t),t}catch(e){throw console.error("❌ Error updating order:",e),e}}static async sendOrderConfirmationEmail(e){try{let{EmailService:r}=await t.e(4268).then(t.bind(t,64268)),o=await r.sendOrderConfirmation(e.customerEmail,e.customerName,{orderId:e.orderId,orderDate:e.orderDate,totalAmount:e.totalAmount,items:e.items,downloadLinks:e.downloadLinks});if(o.success)return{success:!0};return console.warn("⚠️ Email sending failed:",o.error),{success:!1,error:o.error||"Email sending failed"}}catch(e){return console.error("❌ Error sending email:",e),{success:!1,error:e instanceof Error?e.message:"Email sending error"}}}static generateEmailContent(e){let r=e.items.map(e=>`
      <div style="border: 1px solid #e0e0e0; padding: 20px; margin: 10px 0; border-radius: 8px;">
        <h3 style="color: #333; margin: 0 0 10px 0;">${e.title}</h3>
        <p style="margin: 5px 0; color: #666;">Quantity: ${e.quantity}</p>
        <p style="margin: 5px 0; color: #666;">Price: $${e.price}</p>
        ${e.mainImage?`
          <div style="margin: 10px 0;">
            <img src="${e.mainImage}" alt="${e.title}" style="max-width: 200px; height: auto; border-radius: 4px;" />
          </div>
        `:""}
        ${e.pdfUrl?`
          <div style="margin: 10px 0;">
            <a href="${e.pdfUrl}" style="background: #007bff; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; display: inline-block;">
              📄 Download PDF
            </a>
          </div>
        `:""}
      </div>
    `).join("");return`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - ${e.orderId}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #FAC6CF, #F48FB1); padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎨 Order Confirmation</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Thank you for your purchase!</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0 0 15px 0;">Order Details</h2>
          <p><strong>Order ID:</strong> ${e.orderId}</p>
          <p><strong>Date:</strong> ${new Date(e.orderDate).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> $${e.totalAmount}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0 0 15px 0;">Your Digital Artwork</h2>
          ${r}
        </div>

        ${e.downloadLinks.length>0?`
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #2d5a2d; margin: 0 0 15px 0;">📥 Download Links</h3>
            <p style="margin: 0 0 10px 0; color: #2d5a2d;">Your digital downloads are ready! Click the links below to access your files:</p>
            ${e.downloadLinks.map((e,r)=>`
              <p style="margin: 5px 0;">
                <a href="${e}" style="color: #007bff; text-decoration: none;">Download File ${r+1}</a>
              </p>
            `).join("")}
          </div>
        `:""}

        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #856404; margin: 0 0 10px 0;">📋 Important Information</h3>
          <ul style="color: #856404; margin: 0; padding-left: 20px;">
            <li>Download links are valid for 30 days</li>
            <li>Keep this email for your records</li>
            <li>Contact support if you have any issues</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; margin: 0;">Thank you for choosing Lurevi!</p>
          <p style="color: #666; margin: 5px 0 0 0;">If you have any questions, please contact our support team.</p>
        </div>
      </body>
      </html>
    `}static async updateProductDownloadCounts(e){try{for(let r of e){let{data:e,error:t}=await o.supabase.from("products").select("downloads").eq("id",r.productId).single();if(!t&&e){let{error:t}=await o.supabase.from("products").update({downloads:(e.downloads||0)+r.quantity}).eq("id",r.productId);t&&console.error(`❌ Failed to update download count for product ${r.productId}:`,t)}}}catch(e){console.error("❌ Error updating download counts:",e)}}static async getOrderById(e){try{let{data:r,error:t}=await o.supabase.from("orders").select(`
          *,
          order_items (
            *,
            products (
              id,
              title,
              main_image,
              pdf_url,
              gender,
              categories
            )
          )
        `).eq("id",e).single();if(t)return console.error("❌ Failed to fetch order:",t),{success:!1,error:`Failed to fetch order: ${t.message}`};return{success:!0,order:r}}catch(e){return console.error("❌ Error fetching order:",e),{success:!1,error:e instanceof Error?e.message:"Error fetching order"}}}static async getUserOrders(e){try{let{data:r,error:t}=await o.supabase.from("orders").select(`
          *,
          order_items (
            *,
            products (
              id,
              title,
              main_image,
              images,
              pdf_url,
              price,
              product_type,
              poster_size,
              poster_pricing
            )
          )
        `).eq("customer_id",e).order("created_at",{ascending:!1});if(t)return console.error("❌ Failed to fetch user orders:",t),{success:!1,error:`Failed to fetch user orders: ${t.message}`};return{success:!0,orders:r}}catch(e){return console.error("❌ Error fetching user orders:",e),{success:!1,error:e instanceof Error?e.message:"Error fetching user orders"}}}static async createDelhiveryShipment(e,r){try{let t=this.parseShippingAddress(e.shippingAddress||""),a=e.items.filter(e=>"poster"===e.selectedProductType||"clothing"===e.selectedProductType),s=a.reduce((e,r)=>e+.5*r.quantity,0),d=a.map(e=>`${e.productTitle} x${e.quantity}`).join(", "),n="cod"===e.paymentMethod,c=a.reduce((e,r)=>e+r.totalPrice,0),l={shipments:[{name:e.customerName,add:t.address,pin:t.pincode,city:t.city,state:t.state,country:"India",phone:e.customerPhone,order:r,payment_mode:n?"COD":"Prepaid",cod_amount:n?c.toString():"0",total_amount:c.toString(),products_desc:d,hsn_code:"4911",quantity:a.reduce((e,r)=>e+r.quantity,0).toString(),weight:s.toString(),shipment_width:"10",shipment_height:"5",shipping_mode:"Surface",address_type:"home",return_pin:"400001",return_city:"Mumbai",return_phone:"+919999999999",return_add:"Lurevi Store, Mumbai",return_state:"Maharashtra",return_country:"India",seller_name:"Lurevi",seller_add:"Lurevi Store, Mumbai",order_date:new Date().toISOString().split("T")[0]}],pickup_location:{name:"Lurevi Main Warehouse"}},u=await i.Z.createShipment(l);u?.waybill&&await o.supabase.from("orders").update({notes:`${e.notes||""}
Waybill: ${u.waybill}`.trim()}).eq("id",r)}catch(e){throw console.error("❌ Error creating Delhivery shipment:",e),e}}static parseShippingAddress(e){let r=e.split(",").map(e=>e.trim()),t=r[2]||"",o=t.match(/\b\d{6}\b/),a=o?o[0]:"400001",i=t.replace(/\b\d{6}\b/,"").trim();return{address:r[0]||"Address not provided",city:r[1]||"Mumbai",state:i||"Maharashtra",pincode:a}}}}};