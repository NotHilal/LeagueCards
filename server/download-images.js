import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CARDS_DIR = path.join(__dirname, 'public/images/cards');
const PACKS_DIR = path.join(__dirname, 'public/images/packs');

// Ensure directories exist
if (!fs.existsSync(CARDS_DIR)) fs.mkdirSync(CARDS_DIR, { recursive: true });
if (!fs.existsSync(PACKS_DIR)) fs.mkdirSync(PACKS_DIR, { recursive: true });

// Data Dragon base URL
let DD_VERSION = '14.24.1'; // Will be updated to latest

// Champion name mappings (card name -> Data Dragon name)
const CHAMPION_MAPPINGS = {
  'aatrox': 'Aatrox',
  'ahri': 'Ahri',
  'akali': 'Akali',
  'akshan': 'Akshan',
  'alistar': 'Alistar',
  'ambessa': 'Ambessa',
  'amumu': 'Amumu',
  'anivia': 'Anivia',
  'annie': 'Annie',
  'aphelios': 'Aphelios',
  'ashe': 'Ashe',
  'aurelionsol': 'AurelionSol',
  'aurora': 'Aurora',
  'azir': 'Azir',
  'bard': 'Bard',
  'belveth': 'Belveth',
  'blitzcrank': 'Blitzcrank',
  'brand': 'Brand',
  'braum': 'Braum',
  'briar': 'Briar',
  'caitlyn': 'Caitlyn',
  'camille': 'Camille',
  'cassiopeia': 'Cassiopeia',
  'chogath': 'Chogath',
  'corki': 'Corki',
  'darius': 'Darius',
  'diana': 'Diana',
  'draven': 'Draven',
  'drmundo': 'DrMundo',
  'ekko': 'Ekko',
  'elise': 'Elise',
  'evelynn': 'Evelynn',
  'ezreal': 'Ezreal',
  'fiddlesticks': 'Fiddlesticks',
  'fiora': 'Fiora',
  'fizz': 'Fizz',
  'galio': 'Galio',
  'gangplank': 'Gangplank',
  'garen': 'Garen',
  'gnar': 'Gnar',
  'gragas': 'Gragas',
  'graves': 'Graves',
  'gwen': 'Gwen',
  'hecarim': 'Hecarim',
  'heimerdinger': 'Heimerdinger',
  'hwei': 'Hwei',
  'illaoi': 'Illaoi',
  'irelia': 'Irelia',
  'ivern': 'Ivern',
  'janna': 'Janna',
  'jarvan': 'JarvanIV',
  'jax': 'Jax',
  'jayce': 'Jayce',
  'jhin': 'Jhin',
  'jinx': 'Jinx',
  'kaisa': 'Kaisa',
  'kalista': 'Kalista',
  'karma': 'Karma',
  'karthus': 'Karthus',
  'kassadin': 'Kassadin',
  'katarina': 'Katarina',
  'kayle': 'Kayle',
  'kayn': 'Kayn',
  'kennen': 'Kennen',
  'khazix': 'Khazix',
  'kindred': 'Kindred',
  'kled': 'Kled',
  'kogmaw': 'KogMaw',
  'ksante': 'KSante',
  'leblanc': 'Leblanc',
  'leesin': 'LeeSin',
  'leona': 'Leona',
  'lillia': 'Lillia',
  'lissandra': 'Lissandra',
  'lucian': 'Lucian',
  'lulu': 'Lulu',
  'lux': 'Lux',
  'malphite': 'Malphite',
  'malzahar': 'Malzahar',
  'maokai': 'Maokai',
  'masteryi': 'MasterYi',
  'mel': 'Mel',
  'milio': 'Milio',
  'missfortune': 'MissFortune',
  'mordekaiser': 'Mordekaiser',
  'morgana': 'Morgana',
  'naafiri': 'Naafiri',
  'nami': 'Nami',
  'nasus': 'Nasus',
  'nautilus': 'Nautilus',
  'neeko': 'Neeko',
  'nidalee': 'Nidalee',
  'nilah': 'Nilah',
  'nocturne': 'Nocturne',
  'nunu': 'Nunu',
  'olaf': 'Olaf',
  'orianna': 'Orianna',
  'ornn': 'Ornn',
  'pantheon': 'Pantheon',
  'poppy': 'Poppy',
  'pyke': 'Pyke',
  'qiyana': 'Qiyana',
  'quinn': 'Quinn',
  'rakan': 'Rakan',
  'rammus': 'Rammus',
  'reksai': 'RekSai',
  'rell': 'Rell',
  'renataglasc': 'Renata',
  'renekton': 'Renekton',
  'rengar': 'Rengar',
  'riven': 'Riven',
  'rumble': 'Rumble',
  'ryze': 'Ryze',
  'samira': 'Samira',
  'sejuani': 'Sejuani',
  'senna': 'Senna',
  'seraphine': 'Seraphine',
  'sett': 'Sett',
  'shaco': 'Shaco',
  'shen': 'Shen',
  'shyvana': 'Shyvana',
  'singed': 'Singed',
  'sion': 'Sion',
  'sivir': 'Sivir',
  'skarner': 'Skarner',
  'smolder': 'Smolder',
  'sona': 'Sona',
  'soraka': 'Soraka',
  'swain': 'Swain',
  'sylas': 'Sylas',
  'syndra': 'Syndra',
  'tahmkench': 'TahmKench',
  'taliyah': 'Taliyah',
  'talon': 'Talon',
  'taric': 'Taric',
  'teemo': 'Teemo',
  'thresh': 'Thresh',
  'tristana': 'Tristana',
  'trundle': 'Trundle',
  'tryndamere': 'Tryndamere',
  'twistedfate': 'TwistedFate',
  'twitch': 'Twitch',
  'udyr': 'Udyr',
  'urgot': 'Urgot',
  'varus': 'Varus',
  'vayne': 'Vayne',
  'veigar': 'Veigar',
  'velkoz': 'Velkoz',
  'vex': 'Vex',
  'vi': 'Vi',
  'viego': 'Viego',
  'viktor': 'Viktor',
  'vladimir': 'Vladimir',
  'volibear': 'Volibear',
  'warwick': 'Warwick',
  'wukong': 'MonkeyKing',
  'xayah': 'Xayah',
  'xerath': 'Xerath',
  'xinzhao': 'XinZhao',
  'xolaani': 'Xolaani',
  'yasuo': 'Yasuo',
  'yone': 'Yone',
  'yorick': 'Yorick',
  'yuumi': 'Yuumi',
  'zac': 'Zac',
  'zed': 'Zed',
  'zeri': 'Zeri',
  'ziggs': 'Ziggs',
  'zilean': 'Zilean',
  'zoe': 'Zoe',
  'zyra': 'Zyra'
};

// Summoner spell mappings
const SUMMONER_SPELL_MAPPINGS = {
  'flash': 'SummonerFlash',
  'ignite': 'SummonerDot',
  'heal': 'SummonerHeal',
  'barrier': 'SummonerBarrier',
  'exhaust': 'SummonerExhaust',
  'teleport': 'SummonerTeleport',
  'ghost': 'SummonerHaste',
  'cleanse': 'SummonerBoost',
  'smite': 'SummonerSmite',
  'snowball': 'SummonerSnowball',
  'clarity': 'SummonerMana'
};

// Item ID mappings (item name -> Data Dragon item ID)
const ITEM_MAPPINGS = {
  // AD Items
  'infinityedge': '3031',
  'bloodthirster': '3072',
  'botrk': '3153',
  'lorddominiks': '3036',
  'essencereaver': '3508',
  'navori': '6675',
  'rapidfire': '3094',
  'mortalreminder': '3033',
  'stormrazor': '3095',
  'guinsoos': '3124',
  'terminus': '3302',
  'youmuus': '3142',
  'serpentsfang': '6694',
  'umbralglaive': '6693',
  'hubris': '6698',
  'opportunity': '6701',
  'profanehydra': '6699',
  'ravenoushydra': '3074',
  'titanichydra': '3748',
  'hexplate': '6697',
  'stridebreaker': '6631',
  'krakenslayer': '6672',
  'collector': '6676',
  'phantomdancer': '3046',
  'edgeofnight': '3814',
  // AP Items
  'rabadons': '3089',
  'zhonyas': '3157',
  'voidstaff': '3135',
  'ludens': '6655',
  'shadowflame': '4645',
  'lichbane': '3100',
  'nashors': '3115',
  'rylais': '3116',
  'morellonomicon': '3165',
  'horizonfocus': '4628',
  'cosmicdrive': '4629',
  'stormsurge': '6653',
  'cryptbloom': '4646',
  'banshees': '3102',
  'mejais': '3041',
  'archangels': '3003',
  'rodofages': '3027',
  'malignance': '6657',
  'liandrys': '4637',
  'riftmaker': '4633',
  'blackfiretorch': '4636',
  // Tank Items
  'warmogs': '3083',
  'sunfirecape': '3068',
  'thornmail': '3075',
  'randuins': '3143',
  'deadmansplate': '3742',
  'frozenheart': '3110',
  'spiritvisage': '3065',
  'forceofnature': '4401',
  'gargoyle': '3193',
  'unendingdespair': '6665',
  'kaenic': '6667',
  'abyssalmask': '8020',
  'heartsteel': '6662',
  'jaksho': '6664',
  'iceborn': '6662',
  // Support Items
  'redemption': '3107',
  'locket': '3190',
  'mikaels': '3222',
  'ardentcenser': '3504',
  'staffofflowingwater': '6616',
  'shurelyas': '2065',
  'knightsvow': '3109',
  'zekes': '3050',
  'imperialmandate': '4005',
  'echoesofhelia': '6617',
  'moonstone': '6617',
  'dawncore': '6618',
  'dreammaker': '6621',
  'celestialopposition': '6620',
  // Boots
  'berserkers': '3006',
  'sorcerers': '3020',
  'steelcaps': '3047',
  'mercurys': '3111',
  'swiftness': '3009',
  'ionianboots': '3158',
  'symbioticsoles': '3013',
  // Consumables
  'healthpotion': '2003',
  'manapotion': '2004',
  'refillable': '2031',
  'corruptingpotion': '2033',
  'elixirofwrath': '2140',
  'elixirofsorcery': '2139',
  'stopwatch': '2420',
  'guardianangel': '3026'
};

// Download function
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filepath)) {
      console.log(`  [SKIP] ${path.basename(filepath)} already exists`);
      resolve('skipped');
      return;
    }

    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`  [OK] ${path.basename(filepath)}`);
          resolve('downloaded');
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        file.close();
        fs.unlinkSync(filepath);
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      } else {
        file.close();
        fs.unlinkSync(filepath);
        console.log(`  [FAIL] ${path.basename(filepath)} - Status ${response.statusCode}`);
        resolve('failed');
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      console.log(`  [ERROR] ${path.basename(filepath)} - ${err.message}`);
      resolve('error');
    });
  });
}

// Get latest Data Dragon version
async function getLatestVersion() {
  return new Promise((resolve, reject) => {
    https.get('https://ddragon.leagueoflegends.com/api/versions.json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const versions = JSON.parse(data);
          resolve(versions[0]);
        } catch (e) {
          resolve(DD_VERSION);
        }
      });
    }).on('error', () => resolve(DD_VERSION));
  });
}

// Sleep function for rate limiting
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log('='.repeat(60));
  console.log('League of Legends Card Image Downloader');
  console.log('='.repeat(60));

  // Get latest version
  console.log('\nFetching latest Data Dragon version...');
  DD_VERSION = await getLatestVersion();
  console.log(`Using Data Dragon version: ${DD_VERSION}\n`);

  const stats = { downloaded: 0, skipped: 0, failed: 0 };

  // Download Champions
  console.log('\n--- CHAMPIONS ---');
  for (const [filename, ddName] of Object.entries(CHAMPION_MAPPINGS)) {
    const url = `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/champion/${ddName}.png`;
    const filepath = path.join(CARDS_DIR, `${filename}.jpg`);
    const result = await downloadImage(url, filepath);
    stats[result]++;
    await sleep(50); // Rate limiting
  }

  // Download Summoner Spells
  console.log('\n--- SUMMONER SPELLS ---');
  for (const [filename, ddName] of Object.entries(SUMMONER_SPELL_MAPPINGS)) {
    const url = `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/spell/${ddName}.png`;
    const filepath = path.join(CARDS_DIR, `${filename}.jpg`);
    const result = await downloadImage(url, filepath);
    stats[result]++;
    await sleep(50);
  }

  // Download Items
  console.log('\n--- ITEMS ---');
  for (const [filename, itemId] of Object.entries(ITEM_MAPPINGS)) {
    const url = `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/img/item/${itemId}.png`;
    const filepath = path.join(CARDS_DIR, `${filename}.jpg`);
    const result = await downloadImage(url, filepath);
    stats[result]++;
    await sleep(50);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('DOWNLOAD COMPLETE');
  console.log('='.repeat(60));
  console.log(`Downloaded: ${stats.downloaded}`);
  console.log(`Skipped (already exist): ${stats.skipped}`);
  console.log(`Failed: ${stats.failed}`);
  console.log('\nNote: Runes and jungle monsters need custom images.');
  console.log('They are not available in Data Dragon.');
}

main().catch(console.error);
