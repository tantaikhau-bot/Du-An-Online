// Run with the local game server listening on WISH_AUDIO_TEST_URL.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({
    executablePath: process.env.WISH_CHROME || undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 844, height: 390 }, deviceScaleFactor: 3, hasTouch: true
    });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(process.env.WISH_AUDIO_TEST_URL || 'http://127.0.0.1:8080/play', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => WWAudio.panel());
    const panel = page.getByRole('dialog').filter({ hasText: 'Khôi phục mặc định' }).last();
    assert.equal(await panel.getByRole('slider').count(), 8);
    await panel.getByLabel('Bật âm thanh').check();
    await page.waitForFunction(() => WWAudio.stats().state === 'running');
    await panel.getByLabel('Chế độ nhẹ').check();
    await panel.getByLabel('Âm lượng tổng').fill('45');
    const counts = await page.evaluate(() => {
      for(let i=0;i<80;i++) WWAudio.cue('land');
      WWAudio.world(50000,-12,-4.2,0,[{id:'falls',x:-12,z:-4.2}],.4,{wind:1,rain:.5,snow:0,fog:.02},'',1,'grass');
      WWAudio.fight('start',{}, {status:'fight',boss:true,rev:1,hp:100});
      const before=WWAudio.stats();
      WWAudio.fight('start',{}, {status:'fight',boss:true,rev:1,hp:100});
      return [before,WWAudio.stats()];
    });
    assert.equal(counts[0].region,'boss');
    assert.equal(counts[0].voices,counts[1].voices);
    assert.ok(counts[0].voices<=10 && counts[0].buffers<=48);
    await panel.getByLabel('Bật âm thanh').uncheck();
    await page.waitForFunction(() => WWAudio.stats().state === 'suspended');
    await page.reload({waitUntil:'domcontentloaded'});
    const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('ww-audio142')));
    assert.equal(saved.master,.45);
    assert.equal(saved.enabled,false);
    assert.deepEqual(errors,[]);
    console.log('Chromium touch landscape DPR 3: mixer, mute, persistence, voice cap, dungeon deduplication passed.');
  } finally { await browser.close(); }
}
main().catch(e=>{console.error(e);process.exitCode=1});
