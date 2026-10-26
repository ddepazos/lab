export const GOOGLE_FONTS=[
 {name:'Inter',family:'Inter',category:'Sin serifa'}, {name:'Roboto',family:'Roboto',category:'Sin serifa'}, {name:'Montserrat',family:'Montserrat',category:'Sin serifa'},
 {name:'Poppins',family:'Poppins',category:'Sin serifa'}, {name:'Oswald',family:'Oswald',category:'Sin serifa'}, {name:'Space Grotesk',family:'Space Grotesk',category:'Sin serifa'},
 {name:'DM Sans',family:'DM Sans',category:'Sin serifa'}, {name:'Bebas Neue',family:'Bebas Neue',category:'Display'}, {name:'Anton',family:'Anton',category:'Display'},
 {name:'Playfair Display',family:'Playfair Display',category:'Con serifa'}, {name:'Lora',family:'Lora',category:'Con serifa'}, {name:'Pacifico',family:'Pacifico',category:'Manuscrita'},
 {name:'Cinzel',family:'Cinzel',category:'Con serifa'}, {name:'Cormorant Garamond',family:'Cormorant Garamond',category:'Con serifa'},
 {name:'EB Garamond',family:'EB Garamond',category:'Con serifa'}, {name:'Libre Baskerville',family:'Libre Baskerville',category:'Con serifa'},
 {name:'UnifrakturCook',family:'UnifrakturCook',category:'Gótica'}, {name:'UnifrakturMaguntia',family:'UnifrakturMaguntia',category:'Gótica'},
 {name:'Pirata One',family:'Pirata One',category:'Gótica'}, {name:'Grenze Gotisch',family:'Grenze Gotisch',category:'Gótica'},
 {name:'MedievalSharp',family:'MedievalSharp',category:'Fantasía'}, {name:'Almendra',family:'Almendra',category:'Fantasía'},
 {name:'Metal Mania',family:'Metal Mania',category:'Fantasía'}, {name:'New Rocker',family:'New Rocker',category:'Fantasía'},
 {name:'Creepster',family:'Creepster',category:'Fantasía'}, {name:'Rubik Glitch',family:'Rubik Glitch',category:'Fantasía'},
 {name:'Special Elite',family:'Special Elite',category:'Display'}, {name:'Rye',family:'Rye',category:'Display'},
 {name:'Great Vibes',family:'Great Vibes',category:'Manuscrita'}, {name:'Dancing Script',family:'Dancing Script',category:'Manuscrita'}
] as const;
export const DEFAULT_TEXT_FONT='Inter';
export function googleFontUrl(family:string):string{
 const safe=GOOGLE_FONTS.some(f=>f.family===family)?family:DEFAULT_TEXT_FONT;
 return 'https://fonts.googleapis.com/css2?family='+encodeURIComponent(safe).replace(/%20/g,'+')+':wght@400;500;600;700;800&display=swap';
}
