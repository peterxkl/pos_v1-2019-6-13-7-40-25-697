'use strict';
//const fixtures = require('../fixtures');
const promotions = loadPromotions();
const allItems = loadAllItems();
function getPromotionType (barcode) {
    let flag = 0;
    for(let i = 0;i < promotions.length; i++){
       let typeItem = promotions[i];
       let typebarcodes = typeItem.barcodes;
       for(let j = 0;j < typebarcodes.length;j++){
           if(barcode == typebarcodes[j]){
               flag = 1;
               return typeItem.type;
           }
       }
    }
    if(flag==0){
        return "NoPromotion";
    }
}

function getPerSavePrice (item) {
    let savePrice=0;
    let promotionType=getPromotionType(item.barcode);
    if(promotionType==="BUY_TWO_GET_ONE_FREE"){
        //savePrice=9;*peritemDetail.price
        savePrice=parseInt(item.number/3)*item.price;
    }
    return savePrice;
}

function getPerOriginalPrice (item) {
    let originalPrice=item.price*item.number;
    return originalPrice;
}

function addPrice (items) {
    for(let i=0;i<items.length;i++){
        let item=items[i];
        let totalPrice=getPerOriginalPrice (item)-getPerSavePrice(item);
        let savePrice=getPerSavePrice(item);
        item.totalPrice=totalPrice;
        item.savePrice=savePrice;
    }
    return items;
}

function decodeTags (tags) {
    let decodedTags=[];
    let object={};
    tags.filter((num)=>{
      if(num.length>10){
        let number=parseFloat(num.substring(11));
        num=num.substring(0,10);
        object[num] = object[num] ? object[num] +number : number;
      }else{
        object[num]=(object[num]+1)||1;
      }
    });
    let x=Object.keys(object);
    x.filter((num)=>{
        let obj={
          barcode:num,
          number:object[num]
        }
        decodedTags.push(obj);
    });
    return decodedTags;
  }

  function getItemByBarcode (barcode) {
    for(let i=0;i<allItems.length;i++){
        let tag=allItems[i];
        if(tag.barcode==barcode){
            return tag;
        }
    }
}

function getReceiptDetail (decodedTags) {
    let items=[];
    for(let i=0;i<decodedTags.length;i++){
        let item_start=getItemByBarcode(decodedTags[i].barcode);
        let item_end={
            barcode:item_start.barcode,
            name:item_start.name,
            unit:item_start.unit,
            price:item_start.price,
            number:decodedTags[i].number
        }
        items.push(item_end);
    }
    return items;
}

function getReceipt (decodedTags) {
    let result=``;
    let itemDetail=getReceiptDetail(decodedTags);
    let itemIncludeOtherPrice=addPrice(itemDetail);
    let result_mian=``;
    let sumPrice=0;
    let allsavePrice=0;
    for(let i=0;i<itemIncludeOtherPrice.length;i++){
       let item=itemIncludeOtherPrice[i];
       sumPrice=sumPrice+item.totalPrice;
       allsavePrice=allsavePrice+item.savePrice;
       result_mian=`${result_mian}名称：${item.name}，数量：${item.number}${item.unit}，单价：${item.price.toFixed(2)}(元)，小计：${item.totalPrice.toFixed(2)}(元)\n`;
    }
    result=`***<没钱赚商店>收据***\n${result_mian}----------------------\n总计：${sumPrice.toFixed(2)}(元)\n节省：${allsavePrice.toFixed(2)}(元)\n**********************`
    return result;
}

function printReceipt (tags) {
    const decodedTags = decodeTags(tags);
    const result = getReceipt(decodedTags);
    console.log(result);
}