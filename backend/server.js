import http from 'node:http';
import { randomUUID } from 'node:crypto';

const products = [
  {id:1,name:'Sunshine Heirloom Seed Kit',type:'Seeds & planting',price:449},
  {id:2,name:'Everyday Garden Gloves',type:'Tools & equipment',price:349},
  {id:3,name:'Living Soil Compost Blend',type:'Soil & nutrition',price:599},
  {id:4,name:'Copper Watering Can · 1.5 L',type:'Tools & equipment',price:1299},
  {id:5,name:'Pollinator Patch Flower Mix',type:'Seeds & planting',price:299},
  {id:6,name:'Neem & Seaweed Plant Tonic',type:'Soil & nutrition',price:499},
  {id:7,name:'Pruning Snips, Oak Handle',type:'Tools & equipment',price:899},
  {id:8,name:'Kitchen Garden Starter Set',type:'Seeds & planting',price:749},
  {id:9,name:'Organic Vermicompost · 5 kg',type:'Soil & nutrition',price:399},
  {id:10,name:'Classic Hand Trowel',type:'Tools & equipment',price:549},
  {id:11,name:'Kitchen Herb Seed Trio',type:'Seeds & planting',price:249},
  {id:12,name:'Organic Root Growth Fertilizer',type:'Fertilizers',price:549},
  {id:13,name:'Petrol Brush Cutter',type:'Farm Machinery',price:8499},
  {id:14,name:'Electric Grass Cutting Machine',type:'Farm Machinery',price:11999},
  {id:15,name:'Compact Power Tiller',type:'Farm Machinery',price:44999},
  {id:16,name:'Knapsack Power Sprayer',type:'Crop Protection',price:2799},
  {id:17,name:'Drip Irrigation Starter Kit',type:'Irrigation',price:2490},
  {id:18,name:'Hybrid Maize Seeds',type:'Seeds & planting',price:650},
  {id:19,name:'Urea Fertilizer · 45 kg',type:'Fertilizers',price:1200},
  {id:20,name:'NPK 10-26-26 · 50 kg',type:'Fertilizers',price:2100},
  {id:21,name:'Heavy-Duty Farm Tarpaulin',type:'Tools & equipment',price:1299},
  {id:22,name:'Neem Crop Care Concentrate',type:'Crop Protection',price:450}
];
const frontendOrigin = process.env.FRONTEND_ORIGIN || '';
const allowedVercel = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i;
function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
function cors(req,res){const origin=req.headers.origin;if(origin){const local=/^http:\/\/localhost(?::\d+)?$/i.test(origin);if(origin!==frontendOrigin&&!allowedVercel.test(origin)&&!local){send(res,403,{error:'Origin not allowed'});return false}res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin')}res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');return true;}
async function body(req){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>65536)throw new Error('Request is too large')}return raw?JSON.parse(raw):{}}
const server=http.createServer(async(req,res)=>{
  if(!cors(req,res))return;
  if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}
  const path=new URL(req.url,'http://localhost').pathname;
  if(req.method==='GET'&&path==='/api/health')return send(res,200,{ok:true,service:'agrineeds-api'});
  if(req.method==='GET'&&path==='/api/products')return send(res,200,{products});
  if(req.method==='POST'&&path==='/api/quotes'){
    try{
      const input=await body(req);if(!Array.isArray(input.items)||input.items.length<1||input.items.length>50)return send(res,400,{error:'Add between 1 and 50 products.'});
      const items=[];let subtotal=0;
      for(const row of input.items){const p=products.find(x=>x.id===Number(row.productId));const quantity=Number(row.quantity);if(!p||!Number.isInteger(quantity)||quantity<1||quantity>99)return send(res,400,{error:'A product or quantity in your cart is invalid.'});subtotal+=p.price*quantity;items.push({productId:p.id,name:p.name,quantity,unitPrice:p.price,lineTotal:p.price*quantity});}
      const shipping=subtotal>=1499?0:79;return send(res,200,{quoteRef:randomUUID().slice(0,8).toUpperCase(),currency:'INR',items,subtotal,shipping,total:subtotal+shipping,note:'Quote only. Orders are not stored and payments are not processed.'});
    }catch{return send(res,400,{error:'Invalid JSON request.'})}
  }
  return send(res,404,{error:'Not found'});
});
const port=Number(process.env.PORT)||10000;server.listen(port,'0.0.0.0',()=>console.log(`AgriNeeds API listening on ${port}`));
