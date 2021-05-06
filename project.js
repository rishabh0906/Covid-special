const puppy=require("puppeteer");
const fs=require("fs");


let email="winivab163@drluotan.com";
let pwd="qwerty@123";
let preprocess=" Data is related to  website (https://covid.army) \n Needy person can visit this website for more !!";

async function main()
  {
    const browser= await puppy.launch(
       {  headless:false,
          args: [
            '--window-size=1920,1080',
          ] ,defaultViewport:false 
       });
   
    let tabs=await browser.pages();
    let tab=tabs[0];
      
    await tab.goto("https://covid.army/delhi");
    await tab.waitForSelector(".mt-2.text-start.text-left.flex-wrap.flex.items-center.justify-start",{visible:true})
    let selector= await tab.$$(".mt-2.text-start.text-left.flex-wrap.flex.items-center.justify-start");
    let links=await selector[1].$$("a");
    let linksURL=[];
    let fileName=[];
    for(let i=0;i<links.length;i++)
       {
           let link=await tab.evaluate((data)=>{
                       
            return data.getAttribute("href");
           },links[i]);
           linksURL.push("https://covid.army"+link);

           let text=await tab.evaluate((data)=>{
                return data.innerText;
           },links[i]);
           fileName.push(text+".json");
       }

  
     for(let i=0;i<linksURL.length;i++)
       {
        let data={};
         data["url"]=linksURL[i];
         await collect(linksURL[i],browser).then((info)=>{                        //storing data in json files
              data["info"]=info;                                
        });                                                                              
         fs.writeFileSync(fileName[i],JSON.stringify(data));
       }

        await ProcessData(fileName).then((finalData)=>{
        fbWork(tab,finalData,browser);
             
       });


    
    }

async function collect(url,browser)                                        //to collect data from webpages
    {       
      let  page=await browser.newPage() ;
      await page.goto(url);
      await page.waitForTimeout(2000);
      let info = await page.$$(".static-tweet-p");
      let start=info.length/2+1;
      let promises=[];
      for(let i=start;i<info.length;i++)
        {
      let text=await page.evaluate((data)=>{

      return data.innerText;
       },info[i]);

      promises.push(Promise.resolve(text)); 
      }

page.close();
     
return Promise.all(promises);
  
}

async function fbWork(tab,finalData,browser)                                                    //to post data on facebook
    {
      const context = browser.defaultBrowserContext();
      context.overridePermissions("https://www.facebook.com", []);
   await tab.goto("https://www.facebook.com/");
   await tab.type("#email",email,{delay : 100});
   await tab.type("input[type='password']",pwd,{delay : 100});
   await tab.click('button[name="login"]');
   await tab.waitForSelector('a[aria-label="Home"]',{visible : true});
   await tab.click('a[aria-label="Home"]');
   for(let i=0;i<3;i++)
     {
   await tab.waitForSelector(".m9osqain.a5q79mjw.jm1wdb64.k4urcfbm",{visible:true});
   await tab.click(".m9osqain.a5q79mjw.jm1wdb64.k4urcfbm");
   await tab.waitForSelector("._1mf._1mj",{visible:true});
   await tab.type("._1mf._1mj",finalData[i],{delay:100});
   await tab.click('div[aria-label="Post"]');
   await tab.waitForTimeout(10000);
     }
   await browser.close();
  } 

async function ProcessData(filename)                                           //preprocess data
  {
     let finalData=[];
     for(let i=0;i<filename.length;i++)
     {
       fs.readFile(filename[i],(err,data)=>{
        
        if(!err)
        {
          let Inf=JSON.parse(data);
             let rawdata=Inf["info"][0];
             let link=Inf["url"];
             finalData.push(link+"\n"+rawdata+"\n"+preprocess);
        }

       });
     }

     return finalData;
  }

main();                                      //call