function c(o,i){let u=performance.now(),e,t=!1,n=()=>{if(t)return;let r=Math.min(1,(performance.now()-u)/o);i(r),r<1&&(e=setTimeout(n,16))};return n(),()=>{t=!0,clearTimeout(e)}}export{c as a};
