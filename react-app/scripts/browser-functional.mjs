import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const base='http://127.0.0.1:4173/';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
async function check(name,fn){try{await fn();console.log('PASS '+name);}catch(e){await page.screenshot({path:'test-results/failed-'+name+'.png',fullPage:true});throw new Error(name+': '+e.message);}}
try {
await check('load-2d',async()=>{const response=await page.goto(base,{waitUntil:'networkidle'});assert(response?.ok());await page.getByRole('button',{name:'Editor 2D'}).first().click();await page.locator('.konva-overlay canvas').first().waitFor({state:'visible'});});
await check('pencil-stroke-undo',async()=>{await page.locator('button[title="Lápiz"]').click();const canvas=page.locator('.konva-overlay canvas').first();const bounds=await canvas.boundingBox();assert(bounds&&bounds.width>100);await page.mouse.move(bounds.x+bounds.width*.25,bounds.y+bounds.height*.25);await page.mouse.down();await page.mouse.move(bounds.x+bounds.width*.45,bounds.y+bounds.height*.45,{steps:12});await page.mouse.up();await page.locator('.lab-menubar summary').filter({hasText:'Edición'}).click();const undo=page.getByRole('button',{name:'Deshacer último trazo'});assert.equal(await undo.isDisabled(),false,'drawing did not create an undoable stroke');await undo.click();await page.locator('.lab-menubar summary').filter({hasText:'Edición'}).click();assert.equal(await page.getByRole('button',{name:'Deshacer último trazo'}).isDisabled(),true);});
await check('2d-controls',async()=>{await page.locator('button[title="Selección / lienzo"]').click();await page.getByRole('button',{name:'⛶ Ampliar lienzo'}).click();assert(await page.locator('.shell.focus-mode').count()>0);await page.getByRole('button',{name:'Salir de enfoque'}).click();});
await check('3d-scene',async()=>{await page.getByRole('button',{name:'Editor 3D'}).first().click();await page.locator('.scene3d-canvas canvas').waitFor({state:'visible',timeout:15000});const objects=page.getByLabel('Objetos de la escena');await objects.getByText(/Objetos 3D/).waitFor();assert(await objects.getByRole('button',{name:/Nudo toroidal/}).count()>0);await page.locator('.scene3d-bar select').selectOption('box');await objects.getByRole('button',{name:/Cubo/}).waitFor();});
await check('3d-animation-controls',async()=>{const scene=page.locator('.scene3d');assert(await scene.isVisible());assert(await scene.locator('canvas').count()>0);await page.waitForTimeout(500);});
assert.deepEqual(errors,[],'uncaught browser errors');
await page.screenshot({path:'test-results/lab-functional.png',fullPage:true});
console.log('LAB functional checks passed');
}finally{await browser.close();}
