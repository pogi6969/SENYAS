/* SENYAS words: each sign with its English, Filipino and Bikol (Central Bikol) words, how the
   avatar signs it, and how to sign it. Fingerspelling and the core signs here are the forms shared by
   Filipino Sign Language (FSL) and American Sign Language (ASL); local FSL variants exist. */
Hand.SHAPES.NO2 = { f: ["o", "o", "c", "c"], t: "ti" };
Hand.SHAPES.SICK = { f: ["x", "b", "x", "x"], s: [14, 0, -9, -20], t: "out" };
Hand.ORI.Nd = [[0, 0.55, 0.83], [0, -0.83, 0.55]];

var DATA = (function () {
  var CATS = ["greet", "people", "needs", "feel", "quest", "emerg", "time"];
  var ROWS = `
hello|greet|hello|kumusta|kumusta|FLAT.forehead:t@-0.12,0,0.Fa FLAT.temple@-0.35,0.05,0.3.Fa.450|Flat hand at the forehead, then out like a salute.
goodbye|greet|goodbye|paalam|paaram|FLAT.nh.Fa BENT.nh.Fa.250 FLAT.nh.Fa.250 BENT.nh.Fa.250|Open hand, fingers bend down and up: a wave.
thankyou|greet|thank you|salamat|Dios mabalos|FLAT.chin:t.B FLAT.fwdlow@0,0.3,0.U.500|Fingertips at the chin, then the hand moves forward and down.
please|greet|please|pakiusap|tabi|FLAT.chest.B FLAT.chest@0.1,0.1,0.B.250 FLAT.chest@0,0.2,0.B.250 FLAT.chest@-0.1,0.1,0.B.250 FLAT.chest.B.250|Flat hand circles on the chest.
sorry|greet|sorry|pasensya na|pasensya na|A.chest.B A.chest@0.1,0.1,0.B.250 A.chest@0,0.2,0.B.250 A.chest@-0.1,0.1,0.B.250 A.chest.B.250|Closed fist (A) circles on the chest.
yes|greet|yes|oo|iyo|S.nh.Fa S.nh.Nd.200 S.nh.Fa.200 S.nh.Nd.200|Fist nods up and down, like a head nodding.
no|greet|no|hindi|dai|THREE.nh.Fa NO2.nh.Fa.200 THREE.nh.Fa.200 NO2.nh.Fa.200|Index and middle fingers snap down onto the thumb.
welcome|greet|you're welcome|walang anuman|daing anoman|FLAT.n@-0.3,0.1,0.4.U FLAT.stomach@0.1,0,0.U.500|Open palm sweeps in toward the body.
fine|greet|fine|mabuti|marhay man|FIVE.chest:th.Fi FIVE.chest:th@0,0,0.15.Fi.250 FIVE.chest:th.Fi.250|Open hand, thumb taps the chest.
nice|greet|nice|maganda|magayon|FLAT.nc@-0.1,0.12,0.1.D FLAT.nc@-0.45,0.12,0.2.D.500;FLAT.nc.U|Flat hand slides across the other palm.
meet|greet|meet|makilala|mamidbid|ONE.n@-0.3,0,0.S ONE.nc@-0.08,0,0.S.500;ONE.n@-0.3,0,0.S ONE.nc@-0.08,0,0.S.500|Two index fingers, up, come together.
excuse|greet|excuse me|paumanhin|makiagi tabi|BENT.nc@-0.05,0.1,0.D BENT.nc@-0.25,0.1,0.D.300 BENT.nc@-0.05,0.1,0.D.300;FLAT.nc.U|Bent fingertips brush across the other palm.
me|people|I / me|ako|ako|ONE.chest:i.B ONE.chest:i@0,0,0.1.B.200|Point to yourself.
you|people|you|ikaw|ika|ONE.fwd:i.Fw ONE.fwd:i@0,0,0.1.Fw.200|Point to the person.
we|people|we|tayo|kita|ONE.chestR:i.B ONE.heart:i.B.500|Index touches one shoulder side of the chest, then the other.
my|people|my|akin|sako|FLAT.chest.B|Flat palm on the chest.
mother|people|mother|nanay|nanay|FIVE.chin:th.S FIVE.chin:th@0,0,0.12.S.200 FIVE.chin:th.S.200|Open hand, thumb taps the chin.
father|people|father|tatay|tatay|FIVE.forehead:th.S FIVE.forehead:th@0,0,0.12.S.200 FIVE.forehead:th.S.200|Open hand, thumb taps the forehead.
sibling|people|brother / sister|kapatid|tugang|L.forehead:th.S L.nc@0,0.1,0.S.500;L.nc@0,0,0.S|L hand from the head down onto the other L hand.
baby|people|baby|sanggol|aki|FLAT.nc@0,-0.05,0.U FLAT.nc@-0.15,0.05,0.U.400 FLAT.nc@0.1,0.05,0.U.400;FLAT.nc@0,-0.15,0.U FLAT.nc@0.15,-0.05,0.U.400 FLAT.nc@-0.1,-0.05,0.U.400|Arms cradle and rock a baby.
friend|people|friend|kaibigan|katood|X.nc@0,0.1,0.G X.nc@0,0,0.Gd.400;X.nc@0,0,0.Gd X.nc@0,0.1,0.G.400|Hooked index fingers link, then switch.
family|people|family|pamilya|pamilya|F.n@0.15,0.2,0.F F.n@-0.15,0,0.3.S.400 F.nc@0,0,0.3.B.400;F.n@0.15,0.2,0.F F.n@-0.15,0,0.3.S.400 F.nc@0,0,0.3.B.400|Two F hands draw a circle and meet.
name|people|name|pangalan|pangaran|H.nc@0,0.1,0.G H.nc@0,0.03,0.G.200 H.nc@0,0.1,0.G.200 H.nc@0,0.03,0.G.200;H.nc@0.1,0,0.G|Two H hands, one taps the other twice.
deaf|people|Deaf|bingi|bungog|ONE.ear:i.Bi ONE.mouth:i@-0.1,0,0.Bi.450|Index touches near the ear, then the mouth.
hearing|people|hearing|nakaririnig|nakakadangog|ONE.mouth:i@0,0,0.15.G ONE.mouth:i@0,0.1,0.3.G.250 ONE.mouth:i@0,0,0.4.G.250|Index rolls forward in front of the mouth.
teacher|people|teacher|guro|paratukdo|FLATO.temple:t.Fw FLATO.temple@0,0,0.4.Fw.400;FLATO.temple:t.Fw FLATO.temple@0,0,0.4.Fw.400|Both flat-O hands move forward from the temples.
learn|people|learn|mag-aral|mag-adal|CLAW.nc@0,0.05,0.1.D FLATO.forehead:t.B.500;FLAT.nc.U|Take from the open palm and put it in the head.
doctor|people|doctor|doktor|doktor|D.nc:t@0.05,0.1,0.D D.nc:t@0.05,0.2,0.D.200 D.nc:t@0.05,0.1,0.D.200;FLAT.nc.U|Fingertips tap the inside of the other wrist.
police|people|police|pulis|pulis|C.heart.S C.heart@0,0,0.1.S.200 C.heart.S.200|C hand taps the chest, like a badge.
eat|needs|eat|kain|kakan|FLATO.mouth:t.Bi FLATO.mouth:t@0,-0.05,0.15.Bi.220 FLATO.mouth:t.Bi.220|Flat-O hand taps the mouth.
food|needs|food|pagkain|kakanon|FLATO.mouth:t.Bi FLATO.mouth:t@0,-0.05,0.15.Bi.220 FLATO.mouth:t.Bi.220|Same as eat: flat-O hand taps the mouth.
drink|needs|drink|inom|inom|C.chin.S C.mouth.Bi.450|C hand tips a cup to the mouth.
water|needs|water|tubig|tubig|W.chin:i.S W.chin:i@0,0,0.1.S.200 W.chin:i.S.200|W hand taps the chin.
bathroom|needs|bathroom (CR)|CR / banyo|CR / banyo|T.n.Fa T.n@0.06,0,0.Si.180 T.n.Fa.180 T.n@0.06,0,0.Si.180|T hand shakes side to side.
sleep|needs|sleep|tulog|turog|FIVE.eye@0,0.1,0.1.B FLATO.eye@0,-0.1,0.1.B.500|Open hand closes down over the face.
home|needs|home|bahay|harong|FLATO.mouth:t.Bi FLATO.cheek:t.Bi.400|Flat-O touches the mouth, then the cheek.
house|needs|house|bahay|harong|FLAT.nh@0.32,0.25,0.Si FLAT.n@0,-0.1,0.S.500;FLAT.nh@0.32,0.25,0.Si FLAT.n@0,-0.1,0.S.500|Two flat hands draw a roof and walls.
school|needs|school|paaralan|eskwelahan|FLAT.nc@0,0.25,0.D FLAT.nc@0,0.08,0.D.200 FLAT.nc@0,0.25,0.D.200 FLAT.nc@0,0.08,0.D.200;FLAT.nc.U|Clap twice, palm on palm.
help|needs|help|tulong|tabang|THUMB.nc@0,0.1,0.S THUMB.nc@0,0.35,0.S.500;FLAT.nc.U FLAT.nc@0,0.25,0.U.500|Thumbs-up hand rests on the other palm; both lift.
more|needs|more|dagdag|dagdag|FLATO.nc@-0.25,0,0.S FLATO.nc@-0.08,0,0.S.250 FLATO.nc@-0.25,0,0.S.250 FLATO.nc@-0.08,0,0.S.250;FLATO.nc@-0.25,0,0.S FLATO.nc@-0.08,0,0.S.250 FLATO.nc@-0.25,0,0.S.250 FLATO.nc@-0.08,0,0.S.250|Fingertips of two flat-O hands tap together.
finished|needs|finished|tapos na|tapos na|FIVE.n.B FIVE.n@-0.1,0,0.Fa.300 FIVE.n.B.250 FIVE.n@-0.1,0,0.Fa.250;FIVE.n.B FIVE.n@-0.1,0,0.Fa.300 FIVE.n.B.250 FIVE.n@-0.1,0,0.Fa.250|Both open hands flip out.
want|needs|want|gusto|gusto|CLAW.n@0,0,0.3.U CLAW.n@0,0,-0.1.U.450;CLAW.n@0,0,0.3.U CLAW.n@0,0,-0.1.U.450|Clawed hands, palms up, pull toward you.
need|needs|need|kailangan|kaipuhan|X.n.Fa X.n@0,-0.1,0.D.300 X.n.Fa.250 X.n@0,-0.1,0.D.300|Hooked index bends down firmly.
money|needs|money|pera|kuwarta|FLATO.nc@0,0.18,0.Bi FLATO.nc@0,0.08,0.Bi.200 FLATO.nc@0,0.18,0.Bi.200;FLAT.nc.U|Flat-O taps the open palm.
work|needs|work|trabaho|trabaho|S.nc@0,0.2,0.D S.nc@0,0.1,0.D.200 S.nc@0,0.2,0.D.200;S.nc.D|One fist taps the back of the other.
play|needs|play|laro|kawat|Y.n.Fa Y.n.Si.200 Y.n.Fa.200 Y.n.Si.200;Y.n.Fa Y.n.Si.200 Y.n.Fa.200 Y.n.Si.200|Both Y hands twist back and forth.
go|needs|go|punta|lakaw|ONE.n:i.Bi ONE.fwd:i.Fw.450;ONE.n:i.Bi ONE.fwd:i.Fw.450|Both index fingers arc forward.
come|needs|come|halika|dali|ONE.fwd:i.Fw ONE.n:i.Bi.450;ONE.fwd:i.Fw ONE.n:i.Bi.450|Both index fingers beckon toward you.
stop|needs|stop|tigil|ontok|FLAT.nc@0,0.35,0.S FLAT.nc@0,0.05,0.S.300;FLAT.nc.U|Edge of the hand chops down onto the palm.
wait|needs|wait|sandali|halat|FIVE.n.U CLAW.n.U.180 FIVE.n.U.180 CLAW.n.U.180;FIVE.n.U CLAW.n.U.180 FIVE.n.U.180 CLAW.n.U.180|Both palms up, fingers wiggle.
again|needs|again|ulit|giraray|BENT.nc@0,0.1,0.25.U BENT.nc:t@0,0.05,0.D.450;FLAT.nc.U|Bent hand flips over onto the open palm.
slow|needs|slow|dahan-dahan|hinay-hinay|FLAT.nc@0,0.1,0.D FLAT.nc@0,0.1,0.3.D.800;FLAT.nc.D|One hand slides slowly up the back of the other.
write|needs|write|sulat|surat|FLATO.nc:t@0,0.08,0.D FLATO.nc:t@-0.15,0.05,0.D.400;FLAT.nc.U|Pinched fingers write across the palm.
call|needs|call (phone)|tawag|apod|Y.ear.F Y.ear@0,0,0.1.F.300|Y hand held at the ear like a phone.
see|needs|see|kita|hiling|V.eye:t@0,0,0.05.Bi V.fwd.Fw.400|V from the eyes moves forward.
understand|needs|understand|maintindihan|masabotan|S.temple@0,0,0.1.Bi ONE.temple@0,0,0.1.Bi.300|Fist at the temple, index flicks up.
know|needs|know|alam|aram|BENT.temple:t.Bi BENT.temple:t@0,0,0.1.Bi.200 BENT.temple:t.Bi.200|Fingertips tap the side of the forehead.
not|needs|not|hindi|dai|A.chin:th.S A.chin:th@0,0,0.3.S.350|Thumb under the chin flicks forward.
sign|needs|sign language|senyas|senyas|ONE.nh@0.1,0,0.G ONE.n@0.1,0,0.3.G.300 ONE.nh@0.1,0,0.G.300;ONE.n@0.1,0,0.3.G ONE.nh@0.1,0,0.G.300 ONE.n@0.1,0,0.3.G.300|Index fingers circle in turn.
love|feel|love|pagmamahal|pagkamoot|S.heart.B S.heart@0,0,0.05.B.300;S.heart.B S.heart@0,0,0.05.B.300|Arms cross over the heart.
iloveyou|feel|I love you|Mahal kita|Namumutan taka|ILY.nh.Fa ILY.nh@0,0,0.1.Fa.300|Thumb, index and little finger up.
happy|feel|happy|masaya|maogma|FLAT.chest.B FLAT.chest@0,0.15,0.1.B.250 FLAT.chest.B.250 FLAT.chest@0,0.15,0.1.B.250|Flat hand brushes up the chest.|happy
sad|feel|sad|malungkot|mamundo|FIVE.eye@0,0.05,0.2.F FIVE.mouth@0,-0.1,0.25.F.600;FIVE.eye@0,0.05,0.2.F FIVE.mouth@0,-0.1,0.25.F.600|Open hands slide down in front of the face.|sad
angry|feel|angry|galit|maanggot|CLAW.mouth@0,0,0.2.B CLAW.chin@0,0,0.3.B.400|Clawed hand pulls out from the face.|wh
tired|feel|tired|pagod|pagal|BENT.chestR:t.B BENT.chestR:t@0,-0.1,0.Bi.500;BENT.chestR:t.B BENT.chestR:t@0,-0.1,0.Bi.500|Bent hands on the chest droop down.|sad
sick|feel|sick|may sakit|may hilang|SICK.forehead:t.B SICK.forehead:t@0,0,0.1.B.250;SICK.stomach:t.B SICK.stomach:t@0,0,0.1.B.250|Middle fingers touch the forehead and the stomach.|sad
hungry|feel|hungry|gutom|gutom|C.chest@0,0.25,0.B C.stomach.B.500|C hand moves down the chest.
thirsty|feel|thirsty|uhaw|uhaw|ONE.chin:i.B ONE.neck:i@0,-0.15,0.B.450|Index traces down the throat.
good|feel|good|mabuti|marhay|FLAT.chin:t.B FLAT.nc@0,0.1,0.U.450;FLAT.nc.U|From the chin down to the open palm. A thumbs-up also reads as good.
bad|feel|bad|masama|maraot|FLAT.chin:t.B FLAT.n@0,0,0.D.450|From the chin, the hand flips down. A thumbs-down also reads as bad.
okay|feel|okay|ayos|sige|F.nh.Fa F.nh@0,0,0.1.Fa.250|The OK hand: thumb and index make a circle.
pain|feel|pain / hurt|masakit|makulog|ONE.nc@-0.12,0.3,0.G ONE.nc@-0.12,0.3,0.Fw.250 ONE.nc@-0.12,0.3,0.G.250;ONE.nc@-0.12,0.3,0.G ONE.nc@-0.12,0.3,0.Fw.250 ONE.nc@-0.12,0.3,0.G.250|Index fingers point at each other and twist.|sad
beautiful|feel|beautiful|maganda|magayon|FIVE.mouth@0,0,0.4.B FLATO.chin@0,0,0.3.B.500|Open hand circles the face and closes.|happy
what|quest|what|ano|ano|FIVE.n.U FIVE.n@-0.05,0,0.Ul.200 FIVE.n.U.200;FIVE.n.U FIVE.n@-0.05,0,0.Ul.200 FIVE.n.U.200|Both palms up, shake a little.|wh
where|quest|where|saan|hain|ONE.nh.F ONE.nh.Fi.180 ONE.nh.F.180 ONE.nh.Fi.180|Index finger up, wags side to side.|wh
who|quest|who|sino|siisay|ONE.chin:i.Bi ONE.chin:i@0.05,0.05,0.Bi.200 ONE.chin:i.Bi.200|Index circles in front of the chin.|wh
when|quest|when|kailan|nuarin|ONE.nc@-0.1,0.3,0.2.F ONE.nc@0,0.2,0.F.400;ONE.nc.F|Index circles and lands on the other index.|wh
why|quest|why|bakit|taano|FLAT.forehead:t.B Y.forehead@-0.15,-0.05,0.3.B.400|Fingers at the forehead pull away into a Y.|wh
how|quest|how|paano|paano|BENT.nc@-0.05,0,0.D BENT.nc@-0.05,0.05,0.U.400;BENT.nc@-0.05,0,0.D BENT.nc@-0.05,0.05,0.U.400|Bent hands back to back roll up and out.|wh
emergency|emerg|emergency|emerhensiya|emerhensiya|E.nh.Fa E.nh@-0.08,0,0.Fa.180 E.nh.Fa.180 E.nh@-0.08,0,0.Fa.180|E hand shakes side to side.|wh
hospital|emerg|hospital|ospital|ospital|H.~shoulder@0,0.05,0.25.G H.~shoulder@0,-0.15,0.25.G.300 H.~shoulder@0.1,-0.05,0.25.G.300 H.~shoulder@-0.1,-0.05,0.25.G.300|H fingers draw a cross on the upper arm.
fire|emerg|fire|sunog|kalayo|FIVE.down@0,0.2,0.B CLAW.n.B.250 FIVE.nh.B.250;FIVE.down@0,0.2,0.B CLAW.n.B.250 FIVE.nh.B.250|Both hands rise with wiggling fingers, like flames.|wh
earthquake|emerg|earthquake|lindol|linog|FLAT.n.D FLAT.n@-0.08,0,0.D.150 FLAT.n@0.06,0,0.D.150 FLAT.n@-0.08,0,0.D.150 FLAT.n.D.150;FLAT.n.D FLAT.n@-0.08,0,0.D.150 FLAT.n@0.06,0,0.D.150 FLAT.n@-0.08,0,0.D.150 FLAT.n.D.150|Both palms down shake, like the ground.|wh
flood|emerg|flood|baha|baha|W.chin:i.S FLAT.n@0,-0.2,0.D.300 FLAT.n@0,0.3,0.D.500;FLAT.n@0,-0.2,0.D FLAT.n@0,-0.2,0.D FLAT.n@0,0.3,0.D.500|Water, then both palms rise.|wh
typhoon|emerg|typhoon|bagyo|bagyo|FIVE.nh.S FIVE.nh@0.3,0,0.S.400 FIVE.nh.S.400;FIVE.nh.S FIVE.nh@-0.3,0,0.S.400 FIVE.nh.S.400|Both open hands sway hard, like strong wind.|wh
danger|emerg|danger|panganib|peligro|A.nc@0,0.1,0.S A.nc@0,0.3,0.1.S.250 A.nc@0,0.1,0.S.250;FLAT.nc.B|Thumb brushes up the back of the other hand.|wh
medicine|emerg|medicine|gamot|bulong|SICK.nc:t@0,0.08,0.D SICK.nc:t@0.05,0.1,0.D.200 SICK.nc:t@0,0.08,0.D.200;FLAT.nc.U|Middle finger circles on the open palm.
now|time|now / today|ngayon|ngonyan|BENT.n@0,0.1,0.U BENT.n@0,-0.05,0.U.400;BENT.n@0,0.1,0.U BENT.n@0,-0.05,0.U.400|Both bent hands drop a little.
tomorrow|time|tomorrow|bukas|sa aga|A.cheek:th.S A.cheek:th@0,0,0.3.S.400|Thumb at the cheek moves forward.
yesterday|time|yesterday|kahapon|kasuhapon|A.cheek:th@0,0,0.2.S A.ear:th.S.400|Thumb moves back from the cheek.
morning|time|morning|umaga|aga|FLAT.n@0,-0.25,0.U FLAT.n@0,0.15,0.Up.500;FLAT.nc@0,0,0.Id|One hand rises like the sun over the other arm.
night|time|night|gabi|banggi|BENT.nc@0,0.15,0.D BENT.nc@0,0,0.D.500;FLAT.nc@0,0.05,0.Id|Bent hand sets over the other arm, like the sun going down.`;

  var NUMW = [["zero", "sero", "sero"], ["one", "isa", "saro"], ["two", "dalawa", "duwa"], ["three", "tatlo", "tulo"], ["four", "apat", "apat"], ["five", "lima", "lima"],
    ["six", "anim", "anom"], ["seven", "pito", "pito"], ["eight", "walo", "walo"], ["nine", "siyam", "siyam"], ["ten", "sampu", "sampulo"]];

  var words = {}, list = [];
  ROWS.trim().split("\n").forEach(function (r) {
    var a = r.split("|");
    var w = { id: a[0], cat: a[1], en: a[2], fil: a[3], bcl: a[4], spec: a[5], desc: a[6], face: a[7] || "" };
    words[w.id] = w; list.push(w);
  });
  NUMW.forEach(function (n, i) {
    var w = { id: "n" + i, cat: "num", en: n[0], fil: n[1], bcl: n[2], spec: Avatar.numberSpec(i), desc: i === 10 ? "Thumbs-up, shaken a little." : "Number " + i + " on one hand.", num: i };
    words[w.id] = w; list.push(w);
  });

  /* Phrases: what people say, and the signs that carry it (in sign order). */
  var PHRASES = `
goodmorning|Good morning|Magandang umaga|Marhay na aga|good morning
goodnight|Good evening|Magandang gabi|Marhay na banggi|good night
thanks|Thank you|Salamat po|Dios mabalos|thankyou
welcome|You're welcome|Walang anuman|Daing anoman|welcome
howareyou|How are you?|Kumusta ka?|Kumusta ka?|how you
fine|I'm fine|Mabuti ako|Marhay man ako|me fine
yourname|What is your name?|Ano ang pangalan mo?|Ano an pangaran mo?|you name what
myname|My name is|Ang pangalan ko ay|An pangaran ko si|my name
nicemeet|Nice to meet you|Ikinagagalak kitang makilala|Maogma akong mamidbid ka|nice meet you
deaf|I am Deaf|Bingi ako|Bungog ako|me deaf
slow|Please sign slowly|Pakidahan-dahan ang pagsenyas|Hinay-hinay tabi an pagsenyas|please sign slow
nounderstand|I don't understand|Hindi ko maintindihan|Dai ko nasasabotan|me understand not
repeat|Please repeat|Pakiulit po|Giraray tabi|again please
write|Please write it down|Pakisulat po|Isurat mo tabi|write please
whereCR|Where is the bathroom?|Nasaan ang CR?|Hain an CR?|bathroom where
needhelp|I need help|Kailangan ko ng tulong|Kaipuhan ko nin tabang|me need help
calldoctor|Call a doctor|Tumawag ng doktor|Mag-apod nin doktor|call doctor
sick|I am sick|May sakit ako|May hilang ako|me sick
wherehospital|Where is the hospital?|Nasaan ang ospital?|Hain an ospital?|hospital where
loveyou|I love you|Mahal kita|Namumutan taka|iloveyou
hungry|I'm hungry|Gutom na ako|Gutom na ako|me hungry
thirsty|I'm thirsty|Nauuhaw ako|Uhaw ako|me thirsty
eat|Let's eat|Kain tayo|Magkakan kita|we eat
seeyou|See you tomorrow|Kita tayo bukas|Magkita kita sa aga|see you tomorrow
bye|Goodbye|Paalam|Paaram|goodbye
sorry|I'm sorry|Pasensya na|Pasensya na|sorry
wait|Please wait|Sandali lang po|Halat muna tabi|wait please
stop|Stop!|Tigil!|Ontok!|stop
danger|Danger! Leave now!|Delikado! Umalis na!|Peligro! Lakaw na!|danger go now
fire|There is a fire!|May sunog!|May kalayo!|fire
quake|Earthquake!|Lindol!|Linog!|earthquake
okay|Are you okay?|Ayos ka lang?|Marhay ka lang?|you okay`;
  var phrases = PHRASES.trim().split("\n").map(function (r) { var a = r.split("|"); return { id: a[0], en: a[1], fil: a[2], bcl: a[3], gloss: a[4].split(" ") }; });

  /* Lookup from any written word or phrase (in any of the three languages) to its sign. */
  var index = {};
  function key(s) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ' ]/g, " ").replace(/\s+/g, " ").trim(); }
  function put(k, v) { k = key(k); if (k && !index[k]) index[k] = v; }
  phrases.forEach(function (p) { ["en", "fil", "bcl"].forEach(function (l) { put(p[l], { phrase: p }); }); });
  list.forEach(function (w) {
    ["en", "fil", "bcl"].forEach(function (l) { w[l].split(" / ").forEach(function (x) { put(x, { word: w }); put(x.replace(/\(.*\)/, ""), { word: w }); }); });
  });
  var EXTRA = { i: "me", ako: "me", ko: "me", mo: "you", ka: "you", ikaw: "you", ika: "you", hi: "hello", thanks: "thankyou", ty: "thankyou", ok: "okay", yeah: "yes", nope: "no",
    cr: "bathroom", toilet: "bathroom", comfort: "bathroom", restroom: "bathroom", nasaan: "where", "hello po": "hello", po: null, tabi: null, the: null, a: null, an: null, is: null, am: null, are: null, to: null, ang: null, ng: null, nin: null, sa: null, si: null, ay: null, na: null,
    mama: "mother", ina: "mother", papa: "father", ama: "father", nanay: "mother", tatay: "father", brother: "sibling", sister: "sibling", today: "now", gamot: "medicine", doktora: "doctor", tulungan: "help", tabangi: "help", tulong: "help" };
  Object.keys(EXTRA).forEach(function (k) { index[key(k)] = EXTRA[k] ? { word: words[EXTRA[k]] } : { skip: true }; });
  for (var n = 0; n <= 10; n++) index[String(n)] = { word: words["n" + n] };

  /* Text -> signs: longest phrase match first, then words, then fingerspelling. */
  function toSigns(text) {
    var toks = key(text).split(" ").filter(Boolean), out = [], i = 0;
    while (i < toks.length) {
      var hit = null, len = 0;
      for (var L = Math.min(7, toks.length - i); L >= 1; L--) { var h = index[toks.slice(i, i + L).join(" ")]; if (h) { hit = h; len = L; break; } }
      if (!hit) {
        var t = toks[i];
        if (/^\d+$/.test(t)) t.split("").forEach(function (d) { out.push({ word: words["n" + d] }); });
        else out.push({ spell: t.toUpperCase() });
        i++; continue;
      }
      if (hit.phrase) hit.phrase.gloss.forEach(function (g) { out.push({ word: words[g] }); });
      else if (hit.word) out.push({ word: hit.word });
      i += len;
    }
    return out;
  }
  function find(text) { var h = index[key(text)]; return h && h.word ? h.word : null; }

  /* Learning units. */
  var UNITS = [
    { id: "a1", kind: "abc", items: "ABCDEFGHI".split("") }, { id: "a2", kind: "abc", items: "JKLMNOPQR".split("") },
    { id: "a3", kind: "abc", items: "STUVWXYZ".split("").concat(["Ñ", "NG"]) }, { id: "num", kind: "num", items: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }
  ];
  CATS.forEach(function (c) { UNITS.push({ id: c, kind: "word", items: list.filter(function (w) { return w.cat === c; }).map(function (w) { return w.id; }) }); });

  /* Words the camera reads by itself, and the letters and numbers. */
  var LIVE = ["hello", "yes", "no", "thankyou", "please", "sorry", "where", "water", "eat", "bathroom", "iloveyou", "good", "bad", "okay", "love", "help", "more", "house", "friend", "name", "finished"];

  return { CATS: CATS, words: words, list: list, phrases: phrases, toSigns: toSigns, find: find, key: key, UNITS: UNITS, LIVE: LIVE };
})();
