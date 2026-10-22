export const GOOGLE_FONTS=[
 {name:'Inter',family:'Inter'}, {name:'Roboto',family:'Roboto'}, {name:'Montserrat',family:'Montserrat'},
 {name:'Poppins',family:'Poppins'}, {name:'Oswald',family:'Oswald'}, {name:'Playfair Display',family:'Playfair Display'},
 {name:'Bebas Neue',family:'Bebas Neue'}, {name:'Space Grotesk',family:'Space Grotesk'},
 {name:'DM Sans',family:'DM Sans'}, {name:'Lora',family:'Lora'}, {name:'Anton',family:'Anton'},
 {name:'Pacifico',family:'Pacifico'}
] as const;
export const DEFAULT_TEXT_FONT='Inter';
export function googleFontUrl(family:string):string{
 const safe=GOOGLE_FONTS.some(f=>f.family===family)?family:DEFAULT_TEXT_FONT;
 return 'https://fonts.googleapis.com/css2?family='+encodeURIComponent(safe).replace(/%20/g,'+')+':wght@400;500;600;700;800&display=swap';
}
