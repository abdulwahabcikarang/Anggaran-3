
// --- ASET GAMBAR EKSTERNAL (IMGUR / CND) ---
// Resolusi: High Quality (512x512 px)
// Tahapan: 4 Stage Evolution

export interface SkinStage {
    stage1: string; // 0-25%   (Telur/Biji)
    stage2: string; // 25-50%  (Bayi/Tunas)
    stage3: string; // 50-75%  (Remaja/Pohon Kecil)
    stage4: string; // 75-100% (Dewasa/Pohon Besar/Mekar)
}

export const SKIN_ASSETS: Record<string, SkinStage> = {
    // --- TANAMAN ---
    'default': { // Default Plant
        stage1: 'https://cdn-icons-png.flaticon.com/512/10697/10697262.png', // Biji
        stage2: 'https://cdn-icons-png.flaticon.com/512/1892/1892751.png',   // Tunas
        stage3: 'https://cdn-icons-png.flaticon.com/512/4862/4862372.png',   // Pohon Kecil
        stage4: 'https://cdn-icons-png.flaticon.com/512/628/628283.png'      // Pohon Besar
    },
    'anthurium': {
        stage1: 'https://i.postimg.cc/Gp6QPvxt/plant-anturium-tahap1.png',
        stage2: 'https://i.postimg.cc/nLNkKqGj/plant-anturium-tahap2.png', 
        stage3: 'https://i.postimg.cc/yN2Ph0yc/plant-anturium-tahap3.png', 
        stage4: 'https://i.postimg.cc/JhSq3j5b/plant-anturium-tahap4.png'  
    },
    'monstera': {
        stage1: 'https://i.postimg.cc/7LjV1Sn1/plant-monstera-obliqua-tahap1.png',
        stage2: 'https://i.postimg.cc/5tD358Sp/plant-monstera-obliqua-tahap2.png', 
        stage3: 'https://i.postimg.cc/YST3NQzX/plant-monstera-obliqua-tahap3.png', 
        stage4: 'https://i.postimg.cc/VN2R9XWZ/plant-monstera-obliqua-tahap4.png'  
    },
    'sakura': {
        stage1: 'https://i.postimg.cc/L533MwKT/plant-sakura-tahap1.png',
        stage2: 'https://i.postimg.cc/Hn99CRD3/plant-sakura-tahap2.png', 
        stage3: 'https://i.postimg.cc/prJJt4b1/plant-sakura-tahap3.png', 
        stage4: 'https://i.postimg.cc/sx44RqdL/plant-sakura-tahap4.png'  
    },
    'aglonema': {
        stage1: 'https://i.postimg.cc/1zbH0DrY/plant-aglaonema-tahap1.png',
        stage2: 'https://i.postimg.cc/gJRKgrgS/plant-aglaonema-tahap2.png', 
        stage3: 'https://i.postimg.cc/gJRKgrgs/plant-aglaonema-tahap3.png', 
        stage4: 'https://i.postimg.cc/nz713M31/plant-aglaonema-tahap4.png' 
    },
    'kadupul': {
        stage1: 'https://i.postimg.cc/G2YjX9X5/plant-bunga-kadupul-tahap1.png',
        stage2: 'https://i.postimg.cc/rmW9fzfB/plant-bunga-kadupul-tahap2.png', 
        stage3: 'https://i.postimg.cc/C1D4cdvp/plant-bunga-kadupul-tahap3.png',   
        stage4: 'https://i.postimg.cc/WzvwCjKL/plant-bunga-kadupul-tahap4.png'  
    },
    'wijaya': {
        stage1: 'https://i.postimg.cc/gjWHQd5P/plant-bunga-wijayakusuma-tahap1.png',
        stage2: 'https://i.postimg.cc/j2b4mK9q/plant-bunga-wijayakusuma-tahap2.png', 
        stage3: 'https://i.postimg.cc/4ygQqZMn/plant-bunga-wijayakusuma-tahap3.png', 
        stage4: 'https://i.postimg.cc/2yD7MmJq/plant-bunga-wijayakusuma-tahap4.png'  
    },
    'higanbana': {
        stage1: 'https://i.postimg.cc/gjWHQd5X/plant-higanbana-tahap1.png',
        stage2: 'https://i.postimg.cc/4yQQTqkm/plant-higanbana-tahap2.png', 
        stage3: 'https://i.postimg.cc/6qXfgwSG/plant-higanbana-tahap3.png', 
        stage4: 'https://i.postimg.cc/MHSmNx4R/plant-higanbana-tahap4.png'  
    },
    
    // --- PETS ---
    'pet_default': { // Kucing/Umum
        stage1: 'https://cdn-icons-png.flaticon.com/512/5229/5229330.png', // Telur
        stage2: 'https://cdn-icons-png.flaticon.com/512/2855/2855497.png', // Bayi
        stage3: 'https://cdn-icons-png.flaticon.com/512/1864/1864514.png', // Remaja (Main)
        stage4: 'https://cdn-icons-png.flaticon.com/512/2395/2395796.png'  // Dewasa
    },
    'swan': {
        stage1: 'https://i.postimg.cc/Hn99CRDJ/creature-angsa-tahap1.png',
        stage2: 'https://i.postimg.cc/nrGGtgbj/creature-angsa-tahap2.png', 
        stage3: 'https://i.postimg.cc/8cmmV9Q6/creature-angsa-tahap3.png',   
        stage4: 'https://i.postimg.cc/fyffhpnX/creature-angsa-tahap4.png'  
    },
    'dragon': {
        stage1: 'https://i.postimg.cc/KzdgPnk9/dragon-tahap1-(1).png',
        stage2: 'https://i.postimg.cc/Hxf7wQch/dragon-tahap2-(2).png',
        stage3: 'https://i.postimg.cc/QtRWQp90/dragon-tahap3-(1).png',
        stage4: 'https://i.postimg.cc/k4ktQx6z/dragon-tahap4-(1).png'
    },
    'robot': {
        stage1: 'https://i.postimg.cc/PqCy8SYG/robot-tahap1.png', 
        stage2: 'https://i.postimg.cc/g0xs6gRC/robot-tahap2.png', 
        stage3: 'https://i.postimg.cc/PqCy8SYs/robot-tahap3.png', 
        stage4: 'https://i.postimg.cc/hGXs72xH/robot-tahap4.png'  
    },
    'turtle': {
        stage1: 'https://i.postimg.cc/nrGGtgbq/creature-kura-kura-permata-tahap1.png',
        stage2: 'https://i.postimg.cc/RhLLzy5c/creature-kura-kura-permata-tahap2.png', 
        stage3: 'https://i.postimg.cc/hv11q6Wb/creature-kura-kura-permata-tahap3.png', 
        stage4: 'https://i.postimg.cc/kGvvdz3y/creature-kura-kura-permata-tahap4.png'    
    },
    'jellyfish': {
        stage1: 'https://i.postimg.cc/Bvjp1mH8/ubur-ubur-tahap1.png',
        stage2: 'https://i.postimg.cc/s2MmZT7M/ubur-ubur-tahap2.png', 
        stage3: 'https://i.postimg.cc/R0WdngK0/ubur-ubur-tahap3.png', 
        stage4: 'https://i.postimg.cc/W4xnm0w4/ubur-ubur-tahap4.png'  
    },
    'fox': {
        stage1: 'https://i.postimg.cc/65Hkjy3c/kyuubi-tahap1.png',
        stage2: 'https://i.postimg.cc/9Fx68rM9/kyuubi-tahap2.png',
        stage3: 'https://i.postimg.cc/9Fx68rMP/kyuubi-tahap3.png',
        stage4: 'https://i.postimg.cc/4N8DLmdt/kyuubi-tahap4.png'
    },
};
