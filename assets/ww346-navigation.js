
(()=>{const bar=document.createElement('nav');bar.className='releasebar';bar.setAttribute('aria-label','Điều hướng nhanh');bar.innerHTML='<a href="/">✦ Trang chủ</a><button id="quickAccount">Tài khoản</button><button id="quickSave">Lưu game</button><button id="quickCommunity">Cộng đồng</button><small>V35.1.2 · Character Animation · Không thu tiền thật</small>';document.querySelector('header').after(bar);
function jump(id,click=false){const el=document.getElementById(id);if(el){el.scrollIntoView({block:'center'});if(click)el.click()}}
document.getElementById('quickAccount').onclick=()=>jump('cloudAccount',true);document.getElementById('quickSave').onclick=()=>jump('cloudSave',true);document.getElementById('quickCommunity').onclick=()=>jump('socialOpen');
for(const b of document.querySelectorAll('[data-dir]'))bindDirectionButton(b,b.dataset.dir);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopMovement()});})();
