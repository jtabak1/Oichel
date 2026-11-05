// Oichel discovery-only menu endpoint. Configure credentials in Vercel environment variables.
// GET /api/menu?provider=square&locationId=... or ?provider=toast&restaurantGuid=...
export default async function handler(req,res){
 res.setHeader('Cache-Control','s-maxage=300, stale-while-revalidate=600');
 const url=new URL(req.url,'https://oichel.example');
 const provider=url.searchParams.get('provider');
 const fail=(status,message)=>res.status(status).json({error:message});
 try{
  if(provider==='square'){
   const token=process.env.SQUARE_ACCESS_TOKEN;
   const locationId=url.searchParams.get('locationId');
   if(!token)return fail(503,'Square is not connected. Add SQUARE_ACCESS_TOKEN in Vercel.');
   if(!locationId)return fail(400,'Missing Square locationId.');
   const response=await fetch('https://connect.squareup.com/v2/catalog/list?types=ITEM,ITEM_VARIATION,CATEGORY,IMAGE',{headers:{Authorization:'Bearer '+token,'Square-Version':'2025-01-23'}});
   if(!response.ok)return fail(502,'Square menu request failed ('+response.status+').');
   const data=await response.json();
   const objects=data.objects||[];
   const variations=objects.filter(x=>x.type==='ITEM_VARIATION');
   const categories=new Map(objects.filter(x=>x.type==='CATEGORY').map(x=>[x.id,x.category_data?.name]));
   const items=objects.filter(x=>x.type==='ITEM').filter(x=>!x.item_data?.present_at_location_ids||x.item_data.present_at_location_ids.includes(locationId)).map(x=>{
    const vs=variations.filter(v=>x.item_data?.variations?.some(z=>z.id===v.id));
    const price=vs.find(v=>v.item_variation_data?.price_money)?.item_variation_data?.price_money;
    return {id:x.id,name:x.item_data?.name||'Item',description:x.item_data?.description||'',category:categories.get(x.item_data?.category_id)||'Menu',price:price?.amount!=null?(price.amount/100).toFixed(2):null,currency:price?.currency||'USD',image:null};
   });
   return res.status(200).json({provider:'square',items,updatedAt:new Date().toISOString(),note:'Only merchant-authorized catalog data; item availability and pricing require merchant confirmation.'});
  }
  if(provider==='toast'){
   const clientId=process.env.TOAST_CLIENT_ID,clientSecret=process.env.TOAST_CLIENT_SECRET,restaurantGuid=url.searchParams.get('restaurantGuid');
   if(!clientId||!clientSecret)return fail(503,'Toast is not connected. Configure Toast credentials.');
   if(!restaurantGuid)return fail(400,'Missing restaurantGuid.');
   // Toast partner access and authentication vary by integration agreement.
   // Do not send credentials to the browser or attempt an unauthorised API call.
   return fail(503,'Toast partner authentication is not configured yet. Complete Toast API access and implement token exchange before enabling.');
  }
  return fail(400,'Supported providers: square, toast.');
 }catch(e){return fail(502,'Menu provider temporarily unavailable.')}
}
