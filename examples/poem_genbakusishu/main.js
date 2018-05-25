/*
  Copyright (c) 2017-2018, miya
  All rights reserved.

  Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

  1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

  2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
  IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

function Main()
{
  var self = this;
  var FIXED_BITS = 14;
  var FIXED_BITS_ENV = 8;
  var FIXED_SCALE = (1 << FIXED_BITS);
  var ENV_VALUE_MAX = (1 << FIXED_BITS << FIXED_BITS_ENV);
  var VSPEED = 0.001;
  var OBJECTS = 1;
  var saveDocument = '';

  var seq = new Sequencer();
  var visualizer = new Visualizer();

  this.start = function()
  {
    visualizer.start();
    seq.start();
  };

  this.stop = function()
  {
    window.removeEventListener('keyup', evKeyUp);
    window.removeEventListener('click', evClick);
    seq.stop();
    visualizer.stop();
    document.body.innerHTML = saveDocument;
  };

  // callback
  var noteOnCallback = function(data)
  {
    visualizer.fifo.push(data);
  };

  var delayAddEvent = function()
  {
    window.addEventListener('keyup', evKeyUp);
    window.addEventListener('click', evClick);
  };

  var init = function()
  {
    saveDocument = document.body.innerHTML;
    document.body.innerHTML = '<canvas id="canvas1"></canvas>';
    setTimeout(delayAddEvent, 3000);
  };

  this.playPoem = function()
  {
    var i;
    var OSCS = 4;
    var TEMPO = 1.0;
    var PART_VOLUME = (Math.floor(FIXED_SCALE / OSCS));
    var MOD_LEVEL_MAX = (Math.floor(FIXED_SCALE * 0.3));
    var REVERB_VOLUME = (Math.floor(FIXED_SCALE * 0.3));
    var OUT_VOLUME = (1.0 / FIXED_SCALE);
    var chordData = [
      [4, 7, 11,0, 0, 0, 0, 0],
      [0, 4, 9, 0, 0, 0, 0, 0],
      [2, 5, 9, 0, 0, 0, 0, 0]
    ];
    var progressionData = [
      [0, 2],
      [0, 3],
      [1, 2]
    ];
    var poem = [
      {text: '峠三吉　原爆詩集', emphasis: 2.0},
      {text: '  序  ', emphasis: 3.0},
      {text: '  ', emphasis: 1.0},
      {text: 'ちちをかえせ　ははをかえせ', emphasis: 1.0},
      {text: 'としよりをかえせ', emphasis: 1.0},
      {text: 'こどもをかえせ', emphasis: 2.0},
      {text: 'わたしをかえせ　わたしにつながる', emphasis: 1.0},
      {text: 'にんげんをかえせ', emphasis: 2.0},
      {text: 'にんげんの　にんげんのよのあるかぎり', emphasis: 1.0},
      {text: 'くずれぬへいわを', emphasis: 1.0},
      {text: 'へいわをかえせ', emphasis: 3.0},
      {text: '        ', emphasis: 1.0},

      {text: '八月六日', emphasis: 3.0},
      {text: '  ', emphasis: 1.0},
      {text: 'あの閃光が忘れえようか', emphasis: 1.0},
      {text: '瞬時に街頭の三万は消え', emphasis: 1.0},
      {text: '圧しつぶされた暗闇の底で', emphasis: 1.0},
      {text: '五万の悲鳴は絶え', emphasis: 1.0},
      {text: '  ', emphasis: 1.0},
      {text: '渦巻くきいろい煙がうすれると', emphasis: 1.0},
      {text: 'ビルディングは裂け、橋は崩れ', emphasis: 1.0},
      {text: '満員電車はそのまま焦げ', emphasis: 1.0},
      {text: '涯しない瓦礫と燃えさしの堆積であった広島', emphasis: 1.0},
      {text: 'やがてボロ切れのような皮膚を垂れた', emphasis: 1.0},
      {text: '両手を胸に', emphasis: 1.0},
      {text: 'くずれた脳漿を踏み', emphasis: 1.0},
      {text: '焼け焦げた布を腰にまとって', emphasis: 1.0},
      {text: '泣きながら群れ歩いた裸体の行列', emphasis: 1.0},
      {text: '  ', emphasis: 1.0},
      {text: '石地蔵のように散乱した練兵場の屍体', emphasis: 1.0},
      {text: 'つながれた筏へ這いより折り重った河岸の群も', emphasis: 1.0},
      {text: '灼けつく日ざしの下でしだいに屍体とかわり', emphasis: 1.0},
      {text: '夕空をつく火光の中に', emphasis: 1.0},
      {text: '下敷きのまま生きていた母や弟の町のあたりも', emphasis: 1.0},
      {text: '焼けうつり', emphasis: 1.0},
      {text: '  ', emphasis: 1.0},
      {text: '兵器廠の床の糞尿のうえに', emphasis: 1.0},
      {text: 'のがれ横たわった女学生らの', emphasis: 1.0},
      {text: '太鼓腹の、片眼つぶれの、半身あかむけの、丸坊主の', emphasis: 1.0},
      {text: '誰がたれとも分らぬ一群の上に朝日がさせば', emphasis: 1.0},
      {text: 'すでに動くものもなく', emphasis: 1.0},
      {text: '異臭のよどんだなかで', emphasis: 1.0},
      {text: '金ダライにとぶ蠅の羽音だけ', emphasis: 1.0},
      {text: '  ', emphasis: 1.0},
      {text: '三十万の全市をしめた', emphasis: 1.0},
      {text: 'あの静寂が忘れえようか', emphasis: 1.5},
      {text: 'そのしずけさの中で', emphasis: 1.0},
      {text: '帰らなかった妻や子のしろい眼窩が', emphasis: 1.2},
      {text: '俺たちの心魂をたち割って', emphasis: 1.4},
      {text: '込めたねがいを', emphasis: 2.0},
      {text: '忘れえようか！', emphasis: 3.0},
      {text: '        ', emphasis: 1.0},

      {text: '  死  ', emphasis: 3.0},
      {text: '  ', emphasis: 1.0},
      {text: '  ！  ', emphasis: 3.0},
      {text: '泣き叫ぶ耳の奥の声', emphasis: 1.0},
      {text: '音もなく膨れあがり', emphasis: 1.0},
      {text: 'とびかかってきた', emphasis: 1.0},
      {text: '烈しい異状さの空間', emphasis: 1.0},
      {text: 'たち罩めた塵煙の', emphasis: 1.0},
      {text: 'きなくさいはためきの間を', emphasis: 1.0},
      {text: '走り狂う影', emphasis: 1.5},
      {text: '〈あ　にげら　れる〉', emphasis: 1.5},
      {text: 'はね起きる腰から', emphasis: 1.0},
      {text: '崩れ散る煉瓦屑の', emphasis: 1.0},
      {text: 'からだが', emphasis: 1.0},
      {text: '燃えている', emphasis: 1.5},
      {text: '背中から突き倒した', emphasis: 1.0},
      {text: '熱風が', emphasis: 1.5},
      {text: '袖で肩で', emphasis: 1.0},
      {text: '火になって', emphasis: 1.5},
      {text: '煙のなかにつかむ', emphasis: 1.0},
      {text: '水槽のコンクリー角', emphasis: 1.0},
      {text: '水の中に', emphasis: 1.0},
      {text: 'もう頭', emphasis: 1.0},
      {text: '水をかける衣服が', emphasis: 1.0},
      {text: '焦げ散って', emphasis: 1.5},
      {text: ' ない ', emphasis: 2.0},
      {text: '電線材木釘硝子片', emphasis: 1.0},
      {text: '波打つ瓦の壁', emphasis: 1.0},
      {text: '爪が燃え', emphasis: 1.5},
      {text: '踵がとれ', emphasis: 2.0},
      {text: 'せなかに貼りついた鉛の溶鈑', emphasis: 1.0},
      {text: '〈う・う・う・う〉', emphasis: 2.0},
      {text: 'すでに火', emphasis: 1.0},
      {text: ' くろく ', emphasis: 1.0},
      {text: '電柱も壁土も', emphasis: 1.0},
      {text: 'われた頭に噴きこむ', emphasis: 1.5},
      {text: ' 火と煙 ', emphasis: 1.0},
      {text: ' の渦 ', emphasis: 1.0},
      {text: '〈ヒロちゃん　ヒロちゃん〉', emphasis: 2.0},
      {text: '抑える乳が', emphasis: 1.0},
      {text: 'あ　血綿の穴', emphasis: 1.0},
      {text: '倒れたまま', emphasis: 1.0},
      {text: '――おまえおまえおまえはどこ', emphasis: 1.5},
      {text: '腹這いいざる煙の中に', emphasis: 1.0},
      {text: 'どこから現れたか', emphasis: 1.0},
      {text: '手と手をつなぎ', emphasis: 1.5},
      {text: '盆踊りのぐるぐる廻りをつづける', emphasis: 1.0},
      {text: '裸のむすめたち', emphasis: 1.5},
      {text: 'つまずき仆れる環の', emphasis: 1.0},
      {text: '瓦の下から', emphasis: 1.0},
      {text: 'またも肩', emphasis: 1.5},
      {text: '髪のない老婆の', emphasis: 1.0},
      {text: '熱気にあぶり出され', emphasis: 1.0},
      {text: 'のたうつ癇高いさけび', emphasis: 1.5},
      {text: 'もうゆれる炎の道ばた', emphasis: 1.0},
      {text: 'タイコの腹をふくらせ', emphasis: 1.0},
      {text: '唇までめくれた', emphasis: 1.5},
      {text: 'あかい肉塊たち', emphasis: 1.5},
      {text: '足首をつかむ', emphasis: 1.0},
      {text: 'ずるりと剥けた手', emphasis: 1.0},
      {text: 'ころがった眼で叫ぶ', emphasis: 1.5},
      {text: '白く煮えた首', emphasis: 1.5},
      {text: '手で踏んだ毛髪、脳漿', emphasis: 1.0},
      {text: 'むしこめる煙、ぶっつかる火の風', emphasis: 1.0},
      {text: 'はじける火の粉の闇で', emphasis: 1.0},
      {text: '金いろの子供の瞳', emphasis: 1.0},
      {text: '燃える体', emphasis: 1.5},
      {text: '灼ける咽喉', emphasis: 1.5},
      {text: 'どっと崩折れて', emphasis: 1.0},
      {text: ' 腕 ', emphasis: 1.5},
      {text: 'めりこんで', emphasis: 1.0},
      {text: ' 肩 ', emphasis: 1.5},
      {text: 'おお　もう', emphasis: 1.5},
      {text: 'すすめぬ', emphasis: 1.0},
      {text: '暗いひとりの底', emphasis: 1.0},
      {text: 'こめかみの轟音が急に遠のき', emphasis: 1.0},
      {text: 'ああ', emphasis: 2.0},
      {text: 'どうしたこと', emphasis: 1.0},
      {text: 'どうしてわたしは', emphasis: 1.5},
      {text: '道ばたのこんなところで', emphasis: 1.5},
      {text: 'おまえからもはなれ', emphasis: 1.5},
      {text: 'し、死な', emphasis: 2.0},
      {text: 'ねば', emphasis: 2.0},
      {text: 'な', emphasis: 2.0},
      {text: 'らぬ', emphasis: 3.0},
      {text: '  か  ', emphasis: 3.0},
      {text: '        ', emphasis: 1.0},

      {text: '  炎  ', emphasis: 3.0},
      {text: '  ', emphasis: 1.0},
      {text: '衝き当った天蓋の', emphasis: 1.0},
      {text: 'まくれ拡がった死被の', emphasis: 1.0},
      {text: '垂れこめた雲の', emphasis: 1.5},
      {text: '薄闇の地上から', emphasis: 1.0},
      {text: '煙をはねのけ', emphasis: 1.0},
      {text: '歯がみし', emphasis: 1.0},
      {text: 'おどりあがり', emphasis: 1.5},
      {text: '合体して', emphasis: 1.5},
      {text: '黒い　あかい　蒼い炎は', emphasis: 1.0},
      {text: '煌く火の粉を吹き散らしながら', emphasis: 1.0},
      {text: 'いまや全市のうえに', emphasis: 1.5},
      {text: '立ちあがった。', emphasis: 1.5},
      {text: '  ', emphasis: 1.0},
      {text: '藻のように　ゆれゆれ', emphasis: 1.0},
      {text: 'つきすすむ炎の群列。', emphasis: 1.0},
      {text: '屠殺場へ曳かれていた牛の群は', emphasis: 1.0},
      {text: '河岸をなだれ墜ち', emphasis: 1.0},
      {text: '灰いろの鳩が一羽', emphasis: 1.5},
      {text: '羽根をちぢめて橋のうえにころがる。', emphasis: 1.0},
      {text: 'ぴょこ　ぴょこ', emphasis: 1.5},
      {text: '噴煙のしたから這い出て', emphasis: 1.0},
      {text: '火にのまれゆくのは', emphasis: 1.0},
      {text: '四足の', emphasis: 1.5},
      {text: '無数の人間。', emphasis: 2.0},
      {text: '噴き崩れた余燼のかさなりに', emphasis: 1.0},
      {text: '髪をかきむしったまま', emphasis: 1.5},
      {text: '硬直した', emphasis: 1.5},
      {text: '呪いが燻る', emphasis: 2.0},
      {text: '  ', emphasis: 1.0},
      {text: '濃縮され', emphasis: 1.0},
      {text: '爆発した時間のあと', emphasis: 1.2},
      {text: '灼熱の憎悪だけが', emphasis: 1.5},
      {text: 'ばくばくと拡がって。', emphasis: 1.5},
      {text: '空間に堆積する', emphasis: 1.0},
      {text: '無韻の沈黙', emphasis: 1.5},
      {text: '  ', emphasis: 1.0},
      {text: '太陽をおしのけた', emphasis: 1.0},
      {text: 'ウラニューム熱線は', emphasis: 1.0},
      {text: '処女の背肉に', emphasis: 1.0},
      {text: '羅衣の花模様を焼きつけ', emphasis: 1.2},
      {text: '司祭の黒衣を', emphasis: 1.2},
      {text: '瞬間　燃えあがらせ', emphasis: 1.5},
      {text: '1945, Aug. 6', emphasis: 2.0},
      {text: 'まひるの中の真夜', emphasis: 1.0},
      {text: '人間が神に加えた', emphasis: 1.5},
      {text: 'たしかな火刑。', emphasis: 2.0},
      {text: 'この一夜', emphasis: 1.5},
      {text: 'ひろしまの火光は', emphasis: 2.0},
      {text: '人類の寝床に映り', emphasis: 1.0},
      {text: '歴史はやがて', emphasis: 1.5},
      {text: 'すべての神に似るものを', emphasis: 2.0},
      {text: '待ち伏せる。', emphasis: 2.0},
      {text: '        ', emphasis: 1.0},

      {text: 'ちいさい子', emphasis: 3.0},
      {text: '  ', emphasis: 1.0},
      {text: 'ちいさい子かわいい子', emphasis: 1.0},
      {text: 'おまえはいったいどこにいるのか', emphasis: 1.0},
      {text: 'ふと躓いた石のように', emphasis: 1.0},
      {text: 'あの晴れた朝わかれたまま', emphasis: 1.0},
      {text: 'みひらいた眼のまえに', emphasis: 1.0},
      {text: '母さんがいない', emphasis: 2.0},
      {text: 'くっきりと空を映すおまえの瞳のうしろで', emphasis: 1.0},
      {text: 'いきなり', emphasis: 2.0},
      {text: 'あか黒い雲が立ちのぼり', emphasis: 1.0},
      {text: '天頂でまくれひろがる', emphasis: 1.0},
      {text: 'あの音のない光りの異変', emphasis: 1.5},
      {text: '無限につづく幼い問のまえに', emphasis: 1.0},
      {text: 'たれがあの日を語ってくれよう', emphasis: 1.5},
      {text: '  ', emphasis: 1.0},
      {text: 'ちいさい子かわいい子', emphasis: 1.5},
      {text: 'おまえはいったいどこにいったか', emphasis: 1.0},
      {text: '近所に預けて作業に出かけた', emphasis: 1.0},
      {text: 'おまえのこと', emphasis: 1.0},
      {text: 'その執念だけにひかされ', emphasis: 1.0},
      {text: '焔の街をつっ走って来た両足うらの腐肉に', emphasis: 1.0},
      {text: '湧きはじめた蛆を', emphasis: 1.5},
      {text: 'きみ悪がる気力もないまま', emphasis: 1.0},
      {text: '仮収容所のくら闇で', emphasis: 1.0},
      {text: 'だまって死んだ母さん', emphasis: 2.0},
      {text: 'そのお腹におまえをおいたまま', emphasis: 1.0},
      {text: '南の島で砲弾に八つ裂かれた父さんが', emphasis: 1.0},
      {text: '別れの涙をぬりこめたやさしいからだが', emphasis: 1.0},
      {text: '火傷と膿と斑点にふくれあがり', emphasis: 1.0},
      {text: 'おなじような多くの屍とかさなって悶え', emphasis: 1.0},
      {text: '非常袋のそれだけは汚れも焼けもせぬ', emphasis: 1.0},
      {text: 'おまえのための新しい絵本を', emphasis: 1.0},
      {text: '枕もとにおいたまま', emphasis: 1.0},
      {text: '動かなくなった', emphasis: 1.5},
      {text: 'あの夜のことを', emphasis: 1.5},
      {text: 'たれがおまえに話してくれよう', emphasis: 1.5},
      {text: '  ', emphasis: 1.0},
      {text: 'ちいさい子かわいい子', emphasis: 1.5},
      {text: 'おまえはいったいどうしているのか', emphasis: 1.0},
      {text: '裸の太陽の雲のむこうでふるえ', emphasis: 1.0},
      {text: '燃える埃の、つんぼになった一本道を', emphasis: 1.0},
      {text: '降り注ぐ火弾、ひかり飛ぶ硝子のきららに', emphasis: 1.0},
      {text: '追われ走るおもいのなかで', emphasis: 1.0},
      {text: '心の肌をひきつらせ', emphasis: 1.2},
      {text: '口ごもりながら', emphasis: 1.0},
      {text: '母さんがおまえを叫び', emphasis: 1.5},
      {text: 'おまえだけ', emphasis: 2.0},
      {text: 'おまえだけにつたえたかった', emphasis: 1.2},
      {text: '父さんのこと', emphasis: 2.0},
      {text: '母さんのこと', emphasis: 2.0},
      {text: 'そしていま', emphasis: 2.0},
      {text: 'おまえひとりにさせてゆく切なさを', emphasis: 1.2},
      {text: 'たれがつたえて', emphasis: 2.0},
      {text: 'つたえてくれよう', emphasis: 2.0},
      {text: '  ', emphasis: 1.0},
      {text: 'そうだわたしは', emphasis: 1.0},
      {text: 'きっとおまえをさがしだし', emphasis: 1.0},
      {text: 'その柔い耳に口をつけ', emphasis: 1.0},
      {text: 'いってやるぞ', emphasis: 2.0},
      {text: '日本中の父さん母さんいとしい坊やを', emphasis: 1.0},
      {text: 'ひとりびとりひきはなし', emphasis: 1.2},
      {text: 'くらい力でしめあげ', emphasis: 1.2},
      {text: 'やがて蠅のように', emphasis: 1.2},
      {text: ' うち殺し ', emphasis: 2.0},
      {text: ' 突きころし ', emphasis: 2.0},
      {text: '狂い死なせたあの戦争が', emphasis: 1.2},
      {text: 'どのようにして', emphasis: 1.5},
      {text: '海を焼き島を焼き', emphasis: 1.0},
      {text: 'ひろしまの町を焼き', emphasis: 1.0},
      {text: 'おまえの澄んだ瞳から、すがる手から', emphasis: 1.0},
      {text: '父さんを奪ったか', emphasis: 2.0},
      {text: '母さんを奪ったか', emphasis: 2.0},
      {text: 'ほんとうのそのことをいってやる', emphasis: 1.5},
      {text: 'いってやるぞ！', emphasis: 3.0},
      {text: '        ', emphasis: 1.0},

      {text: '  墓標  ', emphasis: 3.0},
      {text: '  ', emphasis: 1.0},
      {text: '君たちはかたまって立っている', emphasis: 1.0},
      {text: 'さむい日のおしくらまんじゅうのように', emphasis: 1.0},
      {text: 'だんだん小さくなって片隅におしこめられ', emphasis: 1.0},
      {text: 'いまはもう', emphasis: 1.0},
      {text: '気づくひともない', emphasis: 1.0},
      {text: '一本のちいさな墓標', emphasis: 1.5},
      {text: '  ', emphasis: 1.0},
      {text: '「斉美小学校戦災児童の霊」', emphasis: 1.0},
      {text: '  ', emphasis: 1.0},
      {text: '焼煉瓦で根本をかこみ', emphasis: 1.0},
      {text: '三尺たらずの木切れを立て', emphasis: 1.0},
      {text: '割れた竹筒が花もなくよりかかっている', emphasis: 1.0},
      {text: '  ', emphasis: 1.0},
      {text: 'ＡＢ広告社', emphasis: 1.0},
      {text: 'ＣＤスクーター商会', emphasis: 1.0},
      {text: 'それにすごい看板の', emphasis: 1.0},
      {text: '広島平和都市建設株式会社', emphasis: 1.0},
      {text: 'たちならんだてんぷら建築の裏が', emphasis: 1.0},
      {text: 'みどりに塗った', emphasis: 1.0},
      {text: 'マ杯テニスコートに通じる道の角', emphasis: 1.0},
      {text: '  ', emphasis: 1.0},
      {text: '積み捨てられた瓦とセメント屑', emphasis: 1.0},
      {text: '学校の倒れた門柱が半ばうずもれ', emphasis: 1.0},
      {text: '雨が降れば泥沼となるそのあたり', emphasis: 1.0},
      {text: 'もう使えそうもない市営バラック住宅から', emphasis: 1.0},
      {text: '赤ン坊のなきごえが絶えぬその角に', emphasis: 1.0},
      {text: '  ', emphasis: 1.0},
      {text: '君たちは立っている', emphasis: 1.0},
      {text: 'だんだん朽ちる木になって', emphasis: 1.2},
      {text: '手もなく', emphasis: 1.5},
      {text: '足もなく', emphasis: 1.5},
      {text: 'なにを甘え', emphasis: 1.5},
      {text: 'なにをねだることもなく', emphasis: 1.5},
      {text: 'だまって　だまって', emphasis: 2.0},
      {text: '立っている', emphasis: 2.0},
      {text: '  ', emphasis: 1.0},
      {text: 'いくら呼んでも', emphasis: 1.0},
      {text: 'いくら泣いても', emphasis: 2.0},
      {text: 'お父ちゃんもお母ちゃんも', emphasis: 1.2},
      {text: '来てはくれなかっただろう', emphasis: 1.0},
      {text: 'とりすがる手をふりもぎって', emphasis: 1.0},
      {text: 'よその小父ちゃんは逃げていっただろう', emphasis: 1.0},
      {text: '重いおもい下敷きの', emphasis: 1.0},
      {text: '熱いあつい風の', emphasis: 1.2},
      {text: 'くらいくらい　息のできぬところで', emphasis: 1.0},
      {text: '（ああいったいどんなわるいいたずらをしたというのだ）', emphasis: 1.0},
      {text: 'やわらかい手が', emphasis: 1.5},
      {text: 'ちいさな頚が', emphasis: 1.5},
      {text: '石や鉄や古い材木の下で血を噴き', emphasis: 1.2},
      {text: 'どんなにたやすくつぶれたことか', emphasis: 1.2},
      {text: '  ', emphasis: 1.0},
      {text: '比治山のかげで', emphasis: 1.0},
      {text: '眼をお饅頭のように焼かれた友だちの列が', emphasis: 1.0},
      {text: 'おろおろしゃがみ', emphasis: 1.0},
      {text: '走ってゆく帯剣のひびきに', emphasis: 1.0},
      {text: 'へいたいさん助けて！と呼んだときにも', emphasis: 1.0},
      {text: '君たちにこたえるものはなく', emphasis: 1.0},
      {text: '暮れてゆく水槽のそばで', emphasis: 1.0},
      {text: 'つれてって！と', emphasis: 1.2},
      {text: '西の方をゆびさしたときも', emphasis: 1.0},
      {text: 'だれも手をひいてはくれなかった', emphasis: 1.0},
      {text: '  ', emphasis: 1.0},
      {text: 'そして見まねで水槽につかり', emphasis: 1.0},
      {text: 'いちじくの葉っぱを顔にのせ', emphasis: 1.0},
      {text: 'なんにもわからぬそのままに', emphasis: 1.2},
      {text: '死んでいった', emphasis: 2.0},
      {text: 'きみたちよ', emphasis: 2.0},
      {text: '  ', emphasis: 1.0},
      {text: 'リンゴも匂わない', emphasis: 1.0},
      {text: 'アメダマもしゃぶれない', emphasis: 1.0},
      {text: 'とおいところへいってしまった君たち', emphasis: 1.0},
      {text: '〈ほしがりません……', emphasis: 1.5},
      {text: 'かつまでは〉といわせたのは', emphasis: 1.5},
      {text: 'いったいだれだったのだ！', emphasis: 1.5},
      {text: '  ', emphasis: 1.0},
      {text: '「斉美小学校戦災児童の霊」', emphasis: 1.0},
      {text: '  ', emphasis: 1.0},
      {text: 'だまって立っている君たちの', emphasis: 1.0},
      {text: 'その不思議そうな瞳に', emphasis: 1.0},
      {text: 'にいさんや父さんがしがみつかされていた野砲が', emphasis: 1.0},
      {text: '赤錆びてころがり', emphasis: 1.0},
      {text: 'クローバの窪みで', emphasis: 1.0},
      {text: '外国の兵隊と女のひとが', emphasis: 1.0},
      {text: 'ねそべっているのが見えるこの道の角', emphasis: 1.0},
      {text: '向うの原っぱに', emphasis: 1.0},
      {text: '高くあたらしい塀をめぐらした拘置所の方へ', emphasis: 1.0},
      {text: '戦争をすまい、といったからだという人たちが', emphasis: 1.0},
      {text: 'きょうもつながれてゆくこの道の角', emphasis: 1.0},
      {text: '  ', emphasis: 1.0},
      {text: 'ほんとうに　なんと不思議なこと', emphasis: 1.0},
      {text: '君たちの兎のような耳に', emphasis: 1.0},
      {text: 'そぎ屋根の軒から', emphasis: 1.0},
      {text: '雑音まじりのラジオが', emphasis: 1.0},
      {text: 'どこに何百トンの爆弾を落したとか', emphasis: 1.2},
      {text: '原爆製造の予算が何億ドルにふやされたとか', emphasis: 1.2},
      {text: '増援軍が朝鮮に上陸するとか', emphasis: 1.2},
      {text: 'とくとくとニュースをながすのがきこえ', emphasis: 1.0},
      {text: '青くさい鉄道草の根から', emphasis: 1.0},
      {text: '錆びた釘さえ', emphasis: 1.0},
      {text: 'ひろわれ買われ', emphasis: 1.0},
      {text: 'ああ　君たちは　片づけられ', emphasis: 1.5},
      {text: '忘れられる', emphasis: 2.0},
      {text: 'かろうじてのこされた一本の標柱も', emphasis: 1.0},
      {text: 'やがて土木会社の拡張工事の土砂に埋まり', emphasis: 1.0},
      {text: 'その小さな手や', emphasis: 1.2},
      {text: '頚の骨を埋めた場所は', emphasis: 1.2},
      {text: '何かの下になって', emphasis: 1.2},
      {text: '永久にわからなくなる', emphasis: 1.5},
      {text: '  ', emphasis: 1.0},
      {text: '「斉美小学校戦災児童の霊」', emphasis: 1.0},
      {text: '  ', emphasis: 1.0},
      {text: '花筒に花はなくとも', emphasis: 1.0},
      {text: '蝶が二羽おっかけっこをし', emphasis: 1.0},
      {text: 'くろい木目に', emphasis: 1.0},
      {text: '風は海から吹き', emphasis: 1.0},
      {text: 'あの日の朝のように', emphasis: 1.0},
      {text: '空はまだ　輝くあおさ', emphasis: 1.0},
      {text: '  ', emphasis: 1.0},
      {text: '君たちよ出てこないか', emphasis: 1.2},
      {text: 'やわらかい腕を交み', emphasis: 1.2},
      {text: '起き上ってこないか', emphasis: 1.5},
      {text: '  ', emphasis: 1.0},
      {text: 'お婆ちゃんは', emphasis: 1.0},
      {text: 'おまつりみたいな平和祭になんかゆくものかと', emphasis: 1.0},
      {text: 'いまもおまえのことを待ち', emphasis: 1.2},
      {text: 'おじいさまは', emphasis: 1.0},
      {text: 'むくげの木蔭に', emphasis: 1.0},
      {text: 'こっそりおまえの古靴をかくしている', emphasis: 1.0},
      {text: '  ', emphasis: 1.0},
      {text: '仆れた母親の乳房にしゃぶりついて', emphasis: 1.0},
      {text: '生き残ったあの日の子供も', emphasis: 1.0},
      {text: 'もう六つ', emphasis: 1.5},
      {text: 'どろぼうをして', emphasis: 1.2},
      {text: 'こじきをして', emphasis: 1.2},
      {text: '雨の道路をうろついた', emphasis: 1.0},
      {text: '君たちの友達も', emphasis: 1.0},
      {text: 'もうくろぐろと陽に焼けて', emphasis: 1.0},
      {text: 'おとなに負けぬ腕っぷしをもった', emphasis: 1.0},
      {text: '  ', emphasis: 1.0},
      {text: '負けるものか', emphasis: 1.2},
      {text: 'まけるものかと', emphasis: 1.5},
      {text: '朝鮮のお友だちは', emphasis: 1.0},
      {text: '炎天の広島駅で', emphasis: 1.0},
      {text: '戦争にさせないための署名をあつめ', emphasis: 1.2},
      {text: '負けるものか', emphasis: 1.2},
      {text: 'まけるものかと', emphasis: 1.5},
      {text: '日本の子供たちは', emphasis: 1.0},
      {text: '靴磨きの道具をすて', emphasis: 1.0},
      {text: 'ほんとうのことを書いた新聞を売る', emphasis: 1.5},
      {text: '  ', emphasis: 1.0},
      {text: '君たちよ', emphasis: 2.0},
      {text: 'もういい　だまっているのはいい', emphasis: 1.2},
      {text: '戦争をおこそうとするおとなたちと', emphasis: 1.2},
      {text: '世界中でたたかうために', emphasis: 1.5},
      {text: 'そのつぶらな瞳を輝かせ', emphasis: 1.5},
      {text: 'その澄みとおる声で', emphasis: 1.5},
      {text: 'ワッ！　と叫んでとび出してこい', emphasis: 1.5},
      {text: 'そして　その', emphasis: 1.0},
      {text: '誰の胸へも抱きつかれる腕をひろげ', emphasis: 1.0},
      {text: 'たれの心へも正しい涙を呼び返す頬をおしつけ', emphasis: 1.2},
      {text: 'ぼくたちはひろしまの', emphasis: 1.5},
      {text: 'ひろしまの子だ　と', emphasis: 2.0},
      {text: 'みんなのからだへ', emphasis: 2.0},
      {text: 'とびついて来い！', emphasis: 3.0},
      {text: '        ', emphasis: 1.0},
      {text: '        ', emphasis: 1.0},
      {text: '        ', emphasis: 1.0},
      {text: '        ', emphasis: 1.0}
    ];
    var bassData = [0];
    init();
    seq.setSeqParam(TEMPO, 8, 8, 6, 3, 16, 2, false, false);
    seq.setChordData(3, chordData, progressionData, bassData);
    seq.synth.setSynthParam(OSCS, 0.557278911565, 0.519439673469, REVERB_VOLUME, 0.8, OUT_VOLUME, 0);
    seq.setCallback(noteOnCallback);
    seq.init();
    visualizer.init(OBJECTS, TEMPO * VSPEED, poem);
    for (i = 0; i < OSCS; i++)
    {
      seq.synth.getParams(i).envelopeDiffA = ENV_VALUE_MAX >> 7;
      seq.synth.getParams(i).envelopeDiffD = (- ENV_VALUE_MAX) >> 17;
      seq.synth.getParams(i).envelopeDiffR = (- ENV_VALUE_MAX) >> 15;
      seq.synth.getParams(i).modLevel0 = MOD_LEVEL_MAX;
    }
    seq.synth.getParams(0).levelL = PART_VOLUME >> 1;
    seq.synth.getParams(0).levelR = PART_VOLUME;
    seq.synth.getParams(1).levelL = PART_VOLUME;
    seq.synth.getParams(1).levelR = PART_VOLUME >> 1;
    self.start();
  };

  var evKeyUp = function(ev)
  {
    if ((ev.key === 'Escape') || (ev.key === 'Esc'))
    {
      self.stop();
    }
  };

  var evClick = function(ev)
  {
    self.stop();
  };
}

var main = new Main();
