const res = await fetch('https://ad.howtostart.in/');
const html = await res.text();
const match = html.match(/index-([^"]+)\.js/);
const hash = match ? match[1] : 'unknown';
const isNew = hash === 'DE4zfyTS';
const isOld = hash === 'DPCehIea';
console.log(isNew ? 'NEW BUNDLE LIVE: index-' + hash + '.js' :
             isOld ? 'OLD BUNDLE: index-' + hash + '.js' :
             'Bundle: index-' + hash + '.js');
// Check if PhoneEntryStep is in the JS bundle
const jsRes = await fetch('https://ad.howtostart.in/assets/index-' + hash + '.js');
const js = await jsRes.text();
console.log('PhoneEntryStep in bundle:', js.includes('PhoneEntryStep'));
console.log('SA country selector:', js.includes('Saudi Arabia'));
console.log('IN country selector:', js.includes('India'));