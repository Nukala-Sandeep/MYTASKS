export async function requestNotifications(){
 if(!('Notification' in window)) return false;
 const result=await Notification.requestPermission();
 return result==='granted';
}
export function notify(title:string,body:string){
 if('Notification' in window && Notification.permission==='granted') new Notification(title,{body});
}
