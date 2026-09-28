// Local search aliases work immediately without a translation service or quota.
const aliases: [string[], string[]][] = [
  [['ไก่', 'ชิกเก้น', 'ชิคเก้น', 'ชิคเคน'], ['chicken']],
  [['เนื้อวัว', 'เนื้อ', 'บีฟ'], ['beef']],
  [['หมู', 'พอร์ค', 'พอร์ก'], ['pork']],
  [['ซีฟู้ด', 'ซีฟูด', 'อาหารทะเล', 'ทะเล'], ['seafood']],
  [['ขนมหวาน', 'ของหวาน', 'ขนม', 'ดีเสิร์ต'], ['dessert']],
  [['ปลา', 'ฟิช'], ['fish', 'salmon', 'tuna', 'cod', 'haddock', 'mackerel', 'sardine', 'trout']],
  [['แซลมอน', 'แซลม่อน'], ['salmon']], [['ทูน่า', 'ทูนา'], ['tuna']],
  [['กุ้ง', 'ชริมป์', 'พรอน'], ['shrimp', 'prawn']], [['ปู', 'แครบ'], ['crab']],
  [['ปลาหมึก', 'หมึก', 'สควิด'], ['squid', 'calamari']], [['หอยแมลงภู่'], ['mussel']],
  [['หอยเชลล์'], ['scallop']], [['หอย'], ['clam', 'mussel', 'scallop', 'oyster']],
  [['เบคอน', 'เบค่อน'], ['bacon']], [['แฮม'], ['ham']],
  [['ไส้กรอก', 'ซอสเซจ'], ['sausage']], [['เป็ด', 'ดั๊ก'], ['duck']],
  [['แกะ', 'แลมบ์'], ['lamb']], [['ไข่', 'เอ้ก'], ['egg']],
  [['ชีส'], ['cheese', 'cheesy']], [['เห็ด', 'มัชรูม'], ['mushroom']],
  [['มันฝรั่ง', 'โปเตโต้'], ['potato']], [['มะเขือเทศ', 'โทเมโท'], ['tomato']],
  [['กระเทียม', 'การ์ลิก'], ['garlic']], [['หัวหอม', 'หอมใหญ่', 'ออเนียน'], ['onion']],
  [['ผักโขม', 'สปิแนช'], ['spinach']], [['บรอกโคลี', 'บร็อคโคลี'], ['broccoli']],
  [['ข้าว', 'ไรซ์'], ['rice']], [['ข้าวผัด', 'ฟรายด์ไรซ์'], ['fried rice']],
  [['เส้น', 'ก๋วยเตี๋ยว', 'นู้ดเดิ้ล', 'นูดเดิล'], ['noodle']],
  [['พาสต้า', 'พาสตา'], ['pasta', 'spaghetti', 'penne', 'fettuccine', 'linguine', 'macaroni', 'lasagne', 'lasagna']],
  [['สปาเก็ตตี้', 'สปาเกตตี', 'สปาเก็ตตี'], ['spaghetti']],
  [['คาโบนาร่า', 'คาร์โบนาร่า', 'คาร์โบนารา'], ['carbonara']],
  [['ลาซานญ่า', 'ลาซานยา'], ['lasagne', 'lasagna']],
  [['โบโลเนส', 'โบโลเนเซ'], ['bolognese']], [['มักกะโรนี'], ['macaroni']],
  [['พิซซ่า', 'พิซซา'], ['pizza']], [['เบอร์เกอร์', 'เบอร์เกอ', 'เบอร์เก้อ'], ['burger']],
  [['แซนด์วิช', 'แซนวิช'], ['sandwich']], [['สเต๊ก', 'สเต็ก'], ['steak']],
  [['สตูว์', 'สตู'], ['stew']], [['ซุป', 'ซูป'], ['soup', 'chowder']],
  [['สลัด', 'สลัดผัก'], ['salad']], [['แกง', 'เคอร์รี่', 'เคอรี่'], ['curry']],
  [['แกงเขียวหวาน'], ['green curry']], [['แกงแดง'], ['red curry']],
  [['มัสมั่น'], ['massaman']], [['ผัดไทย'], ['pad thai']],
  [['ลูกชิ้น', 'มีตบอล', 'มีทบอล'], ['meatball']],
  [['เคฟตา', 'เคฟต้า', 'เกฟตา'], ['kefta']], [['โคฟตา', 'คอฟต้า'], ['kofta']],
  [['เคบับ', 'คีบับ'], ['kebab']], [['ทาโก้', 'ทาโก'], ['taco']],
  [['เบอร์ริโต้', 'เบอร์ริโต'], ['burrito']], [['เอนชิลาดา'], ['enchilada']],
  [['เทอริยากิ', 'เทริยากิ'], ['teriyaki']], [['คัตสึ', 'คัทสึ'], ['katsu']],
  [['บิริยานี', 'ข้าวหมก'], ['biryani']], [['ติ๊กก้า', 'ทิกกา'], ['tikka']],
  [['เค้ก', 'เคก'], ['cake']], [['ชีสเค้ก', 'ชีสเคก'], ['cheesecake']],
  [['แพนเค้ก', 'แพนเคก', 'แพนเค็ก'], ['pancake', 'aebleskiver']],
  [['เอบเลสกีเวอร์', 'แอเบิลสกีเวอร์'], ['aebleskiver']],
  [['วาฟเฟิล', 'วาฟเฟิ้ล'], ['waffle']], [['บราวนี่', 'บราวนี'], ['brownie']],
  [['คุกกี้', 'คุ้กกี้'], ['cookie']], [['บิสกิต', 'บิสกิท'], ['biscuit']],
  [['พุดดิ้ง', 'พุดดิง'], ['pudding']], [['พาย'], ['pie']], [['ทาร์ต', 'ทาร์ท'], ['tart']],
  [['โดนัท', 'โดนัต'], ['donut', 'doughnut']], [['ไอศกรีม', 'ไอติม', 'ไอศครีม'], ['ice cream']],
  [['ช็อกโกแลต', 'ช็อคโกแลต', 'ชอคโกแลต', 'ช็อกโกแล็ต'], ['chocolate', 'choc']],
  [['วานิลลา', 'วนิลา', 'วานิลล่า'], ['vanilla']], [['คาราเมล'], ['caramel']],
  [['กล้วย', 'บานาน่า'], ['banana']], [['แอปเปิล', 'แอปเปิ้ล'], ['apple']],
  [['สตรอว์เบอร์รี', 'สตรอเบอร์รี่', 'สตรอว์เบอร์รี่'], ['strawberry', 'strawberries']],
  [['บลูเบอร์รี่', 'บลูเบอร์รี'], ['blueberry', 'blueberries']],
  [['เลมอน', 'เลม่อน', 'มะนาว'], ['lemon', 'lime']], [['มะพร้าว', 'โคโคนัท'], ['coconut']],
  [['ส้ม', 'ออเรนจ์'], ['orange']], [['มะม่วง', 'แมงโก้'], ['mango']],
  [['ขนมปัง', 'เบรด'], ['bread']], [['เนย', 'บัตเตอร์'], ['butter']],
  [['ทอด', 'ฟรายด์'], ['fried', 'fry']], [['ย่าง', 'กริลล์'], ['grill', 'roast', 'barbecue', 'bbq']],
  [['อบ', 'เบค'], ['bake', 'roast']], [['ผัด'], ['stir', 'fry', 'fried']],
  [['เผ็ด', 'สไปซี่'], ['spicy']], [['หวาน'], ['sweet', 'dessert']],
  [['เปรี้ยวหวาน'], ['sweet and sour']], [['ไทย'], ['thai']], [['ญี่ปุ่น'], ['japanese']],
]

function normalize(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/æ/g, 'ae').replace(/œ/g, 'oe').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\u0e00-\u0e7f]+/g, ' ').trim()
}

const lookup = new Map(aliases.flatMap(([thai, english]) => thai.map((word) => [normalize(word), english] as const)))
const thaiTerms = [...lookup.keys()].sort((a, b) => b.length - a.length)
const tokensPattern = new RegExp(`${thaiTerms.join('|')}|[a-z0-9]+|[\u0e00-\u0e7f]+`, 'g')

export function matchesMealSearch(name: string, query: string, category = ''): boolean {
  const search = normalize(query)
  if (!search) return true
  const title = normalize(`${name} ${category}`)
  if (title.includes(search)) return true
  const tokens = search.match(tokensPattern) ?? []
  return tokens.length > 0 && tokens.every((token) => {
    const alternatives = lookup.get(token)
    return alternatives ? alternatives.some((word) => title.includes(normalize(word))) : title.includes(token)
  })
}
