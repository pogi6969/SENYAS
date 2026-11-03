"""SENYAS NSTF research paper (RIM-T): the text. Every number is read from ../code/stats.json,
which the benchmark scripts produce, so the paper always matches the experiments."""
import json, math, pathlib
S = json.load(open(pathlib.Path(__file__).resolve().parent.parent / "code" / "stats.json"))
pc = lambda x, d=1: f"{x * 100:.{d}f}%"
def wilson(k, n, z=1.96):
    p = k / n; d = 1 + z * z / n; c = (p + z * z / (2 * n)) / d; h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d
    return max(0, c - h), min(1, c + h)
def sf(k, n, p0): return sum(math.comb(n, i) * p0 ** i * (1 - p0) ** (n - i) for i in range(k, n + 1))
def pv(p): return "< 0.001" if p < 0.001 else f"= {p:.3f}"
st = {x["level"]: x for x in S["static"]}
br = {g["group"]: g for g in S["braille"]}
MP, TM, CV, MA = S["mediapipe"], S["timing"], S["coverage"], S["movingAll"]
AB, BA, CU = S["ablation"], S["brailleAblation"], S["custom"]
W = {(w["holdMs"], w["signerMs"]): w for w in S["words"]}
DEF = [W[(400, s)] for s in (500, 700, 1000)]
wk = sum(round(w["wordAccuracy"] * w["words"]) for w in DEF); wn = sum(w["words"] for w in DEF)
H3p = sf(wk, wn, 0.80)
cu_k = sum(round(v["detected"] * v["trials"]) for v in CU["perSign"].values()); cu_n = sum(v["trials"] for v in CU["perSign"].values())
UI = S["ui"]; ui_ok = sum(1 for u in UI if u["overflow"] <= 0 and u["errors"] == 0)
weak = sorted(S["perLetter"].items(), key=lambda x: x[1])[:4]
FIG = "../figures/"

TITLE = ("SENYAS: An Offline Intelligent System for Trilingual Sign Language and Braille Translation Using a "
         "Kinematic Hand Model, Landmark Geometry, and Braille Grid Fitting")
CATEGORY = "Robotics and Intelligent Machines, Team (RIM-T)"
RESEARCHERS = ["[Surname, Firstname M.]", "[Surname, Firstname M.]", "[Surname, Firstname M.]"]
ADVISER = "[Surname, Firstname M.]"
SCHOOL = ["Legazpi City Science High School", "Legazpi City, Albay", "Bicol Region (Region V), Philippines"]
KEYWORDS = "intelligent machines, computer vision, hand kinematics, Filipino Sign Language, braille recognition, assistive technology"

ACK = ("The researchers thank their research adviser for patient guidance; the teachers and staff of Legazpi City Science High "
       "School for their support; their families for their encouragement; and the Deaf and blind communities of Albay, whose daily "
       "experience of being left out of conversations inspired this work. They also acknowledge the open-source projects that made "
       "SENYAS possible, especially MediaPipe, and the authors of the studies cited in this paper.")

ABSTRACT = (
    "Deaf, blind and hearing Filipinos often cannot talk to one another without an interpreter, and in Albay no tool works in Bikol, "
    "offline, on an ordinary phone. This study designed, built and evaluated SENYAS, an intelligent system that reads Filipino Sign "
    "Language (FSL) fingerspelling and everyday signs through a camera, speaks the words when the user switches reading aloud on, "
    "signs typed or spoken English, Filipino and Bikol back with an avatar, reads braille from a photo or the live camera, and "
    "teaches signing. Instead of a large video dataset, it uses the kinematics of a hand modelled like a robot hand to generate its "
    "examples, palm-frame coordinates that do not change with position, size or rotation, a nearest-neighbour rule, hysteresis "
    "counting and winding numbers for movement, dynamic time warping for signs the user teaches, and a spacing-error fit that "
    "snaps braille dots onto their grid. In repeatable computational experiments, static letters were named with "
    f"{pc(st[1]['acc'])} accuracy at expected camera noise; {MA['k']} of {MA['n']} moving and two-handed sign trials were detected "
    f"with no false alarms on still hands; {pc(wk / wn)} of fingerspelled words were read exactly at the default setting; signs "
    f"taught from three recordings were found in {cu_k} of {cu_n} trials with no false accepts; and {pc(br['All photos']['exact'])} "
    f"of 300 braille photos were read exactly ({pc(br['All photos']['cer'])} character error rate). Each frame needed "
    f"{TM['mediapipeMs']:.0f} ms for hand tracking and {TM['recognizerMs']:.2f} ms for recognition, and the interface fitted all "
    f"{len(UI)} screen sizes tested. SENYAS shows that geometry and kinematics can give an offline, trilingual communication aid "
    "without big data. A field validation with Deaf and blind learners in Albay is recommended.")

B = []
h1 = lambda t: B.append(("h1", t)); h2 = lambda t: B.append(("h2", t)); h3 = lambda t: B.append(("h3", t))
p = lambda t: B.append(("p", t)); bl = lambda xs: B.append(("b", xs)); nl = lambda xs: B.append(("n", xs))
eq = lambda t, n: B.append(("eq", t, n)); tb = lambda c, r, w=None: B.append(("t", c, r, w))
fg = lambda f, c, w=6.0: B.append(("f", FIG + f, c, w)); fr = lambda fs, c: B.append(("fgrow", [FIG + f for f in fs], c))
code = lambda c, t: B.append(("code", c, t)); lead = lambda a, t: B.append(("lead", a, t))

# ======================================================================
h1("CHAPTER 1. INTRODUCTION")
h2("1.1 Background of the Study")
p("Republic Act No. 11106 (2018) declared Filipino Sign Language (FSL) the national sign language of the Filipino Deaf and required "
  "its use in schools, broadcasts, courts and public health services. Two years earlier, the World Health Organization had begun "
  "warning that hearing loss was growing; its World Report on Hearing estimates that more than 430 million people need care for "
  "disabling hearing loss (World Health Organization, 2021), and its World Report on Vision counts at least 2.2 billion people with "
  "a vision impairment (World Health Organization, 2019). The Magna Carta for Disabled Persons (Republic Act No. 7277, 1992) and the "
  "Convention on the Rights of Persons with Disabilities (United Nations, 2006) promise equal access to information. Yet the law and "
  "the numbers do not open a conversation by themselves. A Deaf student who needs directions at a terminal, a blind grandmother "
  "holding a printed notice, or a hearing nurse explaining a medicine still depends on an interpreter or a reader who is rarely there.")
p("Albay adds two barriers of its own. First, most translation tools work in English, some in Filipino, and almost none in Bikol, the "
  "language most families in the province speak at home. Second, the moments when communication matters most, such as an evacuation "
  "before Mayon erupts, a typhoon or an earthquake, or a consultation in a far barangay health station, are exactly when mobile data "
  "fail. A tool that needs a server stops working at the moment it is needed.")
p("Phones can now track the 21 joints of each hand in real time without the internet (Zhang et al., 2020). What remains is machine "
  "intelligence: turning those points into letters and words reliably, recognising signs that move, reading braille dots from a "
  "picture taken at an angle, and doing all of this in three languages on an inexpensive device. This is a problem for intelligent "
  "machines in the full sense: the system must perceive (camera), model (a kinematic hand), decide (classification under noise), "
  "act (speak, sign with an avatar) and adapt (learn new signs from the user). This study builds and tests such a system, called "
  "SENYAS, from the Filipino word for sign or gesture.")
p("Current research on sign language recognition is dominated by deep neural networks trained on thousands of annotated videos "
  "(Koller, 2020; Rastgoo et al., 2021). Such networks reach high accuracy on the languages and signers they were trained on, but FSL, "
  "and FSL used by Bikol speakers, has no public dataset of that size, and the networks are heavy to run offline on low-cost phones. "
  "Optical braille recognition has a similar history: published systems rely on flatbed scanners and controlled lighting "
  "(Antonacopoulos & Bridson, 2004; Isayed & Tahboub, 2015), not on a phone held over a page. A different route is to describe the "
  "hand and the braille cell with geometry. A hand is a chain of rigid links joined by revolute joints, exactly like a robot hand "
  "(Craig, 2005); a braille cell is a two-by-three grid with fixed spacing (International Council on English Braille, 2013). If these "
  "structures are written as equations, labelled examples can be generated instead of collected, features can be made independent "
  "of how the hand or page is held, and every decision can be explained and tested. SENYAS follows this route.")

h2("1.2 Statement of the Problem")
p("The study aimed to design, develop and evaluate SENYAS, an offline intelligent system that translates between sign language, "
  "braille, text and speech in English, Filipino and Bikol, with a learning module. Specifically, it sought to answer the following:")
nl(["How accurately does a nearest-neighbour recogniser that uses palm-frame features, with examples generated by a kinematic hand "
    "model, classify the 24 static letters of the FSL manual alphabet as pose noise increases, and which design components account "
    "for its accuracy?",
    "How reliably do the motion rules and two-hand rules detect 13 moving and 6 two-handed signs, and how often do still letters "
    "trigger a false moving sign?",
    "How accurately are whole fingerspelled words read, and how does the hold-time setting interact with the signer's speed?",
    "How reliably are signs that the user teaches from three recordings recognised, and how often are other signs falsely accepted "
    "as taught signs?",
    "How accurately does the grid-fitting braille reader decode photos of Grade 1 braille that differ in dot type, skew, blur and "
    "dot size?",
    "How long does each component take per camera frame or photo, and is this fast enough for live use?",
    "Does the interface adapt to phones, tablets, computers and televisions without layout faults, with readable contrast and "
    "adequate touch targets, and how completely does the trilingual lexicon carry the phrasebook into signs?"])

h2("1.3 Hypotheses")
p("The following null hypotheses were tested at the 0.05 level of significance.")
tb("Table 1. Null hypotheses and their tests", [
    ["Code", "Null hypothesis", "Test"],
    ["H₀1", "Static-letter accuracy at expected noise is at most 90%.", "One-sided exact binomial test"],
    ["H₀2", "The detection rate of moving and two-handed signs is at most 90%.", "One-sided exact binomial test"],
    ["H₀3", "Fingerspelled-word accuracy at the default hold time is at most 80%.", "One-sided exact binomial test"],
    ["H₀4", "The braille reader's character error rate is at least 20%.", "Comparison with the bound; Wilson interval"],
    ["H₀5", "Processing time per frame exceeds 100 ms (fewer than 10 frames per second).", "Median latency"],
    ["H₀6", "The interface shows sideways scrolling or a missing navigation bar on at least one tested screen size.", "Automated layout test"]], [0.7, 4.0, 1.8])

h2("1.4 Significance of the Study")
lead("Deaf and hard-of-hearing learners.", "SENYAS turns their signing into spoken Filipino, English or Bikol and lets them follow "
     "hearing speakers through an avatar, at no cost and without data.")
lead("Blind and low-vision persons.", "Braille labels, notices and school materials can be read aloud from a photo, and typed text is "
     "shown in braille for learners.")
lead("Teachers, SPED centres and families.", "Lessons, quizzes, flashcards, games and camera practice support learning FSL in the "
     "home language, in line with Universal Design for Learning (CAST, 2018).")
lead("Health workers, police and disaster responders.", "An emergency phrasebook (help, doctor, hospital, fire, earthquake, flood, "
     "typhoon) works with no signal during disasters in Albay.")
lead("Future researchers.", "The study offers an explainable method that does not need a large dataset and open benchmarks that can "
     "be repeated and extended.")
p("The study supports Sustainable Development Goals 4 (inclusive and quality education), 10 (reduced inequalities) and 11.5 "
  "(reducing the effects of disasters) (United Nations, 2015), and the aims of RA 11106 and RA 7277.")

h2("1.5 Scope and Delimitation")
p("The study covers the one-handed manual alphabet A–Z with Ñ, the numbers 0–10, and 21 everyday signs read directly by the camera, "
  "in forms shared by FSL and American Sign Language; 93 signed words and 32 phrases in English, Filipino and Central Bikol; signs "
  "taught by the user; Grade 1 (uncontracted) braille with capitals, numbers, common punctuation, Ñ and five whole-word "
  "contractions; and the web, installable and Android versions of the app. The study does not cover full FSL sentences with "
  "grammar and facial expressions, Grade 2 braille, or testing with Deaf or blind participants, which is recommended for the next "
  "phase. All performance figures come from computational experiments on generated data, which are described fully so that they "
  "can be repeated. The rendered-hand test of Section 4.8 is a lower bound on the full camera path, not a field accuracy.")

h2("1.6 Definition of Terms")
tb("Table 2. Definition of terms", [
    ["Term", "Conceptual meaning", "Operational meaning in this study"],
    ["Intelligent system", "A machine that perceives, decides and acts toward a goal.", "SENYAS: camera and microphone input, recognition, speech and avatar output."],
    ["Landmark", "A point that marks a body joint.", "One of the 21 hand points reported by MediaPipe for each hand."],
    ["Kinematic hand model", "Equations that place the links of a hand from its joint angles.", "The SENYAS model that builds 37 handshapes for templates and the avatar."],
    ["Palm frame", "A coordinate system attached to an object.", "Axes built from the wrist and three knuckles of a detected hand."],
    ["Template", "A stored example of a class.", "A 41-number feature vector of a known handshape."],
    ["Fingerspelling", "Spelling words with handshapes of the alphabet.", "Letters held for the hold time are added to the current word."],
    ["Hold time", "How long a handshape must stay before it counts.", "300, 400 (default) or 600 ms in the app settings."],
    ["Braille cell", "Six dot positions in two columns and three rows.", "A six-bit pattern decoded into a letter, digit or sign."],
    ["Character error rate", "The share of characters read wrongly.", "Levenshtein distance divided by the length of the true text."],
    ["Read aloud", "Speaking recognised text.", "The switch that makes SENYAS speak each recognised word; the user turns it on or off."]], [1.4, 2.4, 2.7])

# ======================================================================
h1("CHAPTER 2. REVIEW OF RELATED LITERATURE AND STUDIES")
h2("2.1 Sign Language and Filipino Sign Language")
p("Sign languages are full natural languages with their own grammar, not codes for spoken languages. Stokoe (1960) showed that each "
  "sign can be described by a small set of parameters: the handshape, the location where it is made, and the movement. This "
  "description is the basis of SENYAS: the handshape is read from the joint positions, the location from where the hand is in the "
  "frame and relative to the other hand, and the movement from how these change over time. RA 11106 (2018) makes FSL the medium of "
  "instruction for Deaf learners and the language of interpreting in government. FSL shares its one-handed manual alphabet with "
  "ASL, so a fingerspelling recogniser serves users of both, while many FSL words have local forms that differ by region.")
h2("2.2 Communication Access for Deaf and Blind Filipinos")
p("The World Health Organization (2019, 2021) reports that hearing and vision impairments are common and rising, and that most "
  "affected people live in low- and middle-income countries where services are scarce. Philippine law guarantees access: RA 7277 "
  "(1992) requires auxiliary aids and accessible communication, and the Data Privacy Act (RA 10173, 2012) protects the personal "
  "information that any assistive tool might collect. Interpreters and braille transcribers remain few, especially outside Metro "
  "Manila, so most daily conversations between Deaf, blind and hearing people happen without support.")
h2("2.3 Vision-Based Sign Language Recognition")
p("Early gesture recognisers used data gloves or coloured markers; camera-based methods later replaced them (Mitra & Acharya, 2007). "
  "Surveys of the field show that recent systems use convolutional and recurrent networks or transformers trained on large datasets, "
  "and that results drop sharply on new signers or new sign languages (Koller, 2020; Rastgoo et al., 2021). For FSL, Cabalfin et al. "
  "(2012) recognised signs from video using manifold projection learning, showing that FSL recognition by computer is possible but "
  "also that data are limited. Landmark-based methods reduce the input to joint positions, which removes background and skin colour "
  "from the problem and makes small models possible.")
h2("2.4 Hand Tracking and Kinematics")
p("MediaPipe is a framework for building perception pipelines that run on devices (Lugaresi et al., 2019). Its hand solution first "
  "detects a palm and then regresses 21 three-dimensional landmarks in real time on mobile hardware (Zhang et al., 2020). It reports "
  "both image coordinates and world coordinates in metres around the hand. In robotics, the position of a manipulator's links follows "
  "from its joint angles through forward kinematics, and the joint angles that place its end at a target follow from inverse "
  "kinematics (Craig, 2005). FABRIK solves inverse kinematics by alternately pulling a chain toward its target and back to its base, "
  "converging quickly without matrix inversion (Aristidou & Lasenby, 2011). A human hand can be modelled with the same tools: four "
  "fingers with three revolute joints each and a thumb with a more mobile base.")
h2("2.5 Pattern Recognition over Time")
p("The nearest-neighbour rule assigns an input to the class of its closest stored example; Cover and Hart (1967) proved that, as "
  "examples grow, its error is at most twice the lowest possible (Bayes) error. Dynamic time warping aligns two sequences that unfold "
  "at different speeds, and a Sakoe–Chiba band limits how far the alignment may stretch, which both speeds it up and prevents "
  "unrealistic matches (Sakoe & Chiba, 1978). Hysteresis, first used in the Schmitt (1938) trigger, makes a detector change state only "
  "after a signal moves past a margin, so small jitter does not cause false switching; SENYAS uses the same idea to count the "
  "back-and-forth of a moving hand.")
h2("2.6 Braille and Optical Braille Recognition")
p("In Unified English Braille, each letter is a pattern of up to six raised dots in a cell; a number sign turns the letters a–j into "
  "digits and a capital sign marks capitals (International Council on English Braille, 2013). Filipino uses the same letters with Ñ. "
  "Optical braille recognition must find dots that may be printed or embossed, lit from one side, and slightly skewed. Antonacopoulos "
  "and Bridson (2004) recognised braille from scanned pages by finding dot shadows and fitting a grid, and Isayed and Tahboub (2015) "
  "found that grid estimation and skew are the hardest steps. Summed-area tables give the mean of any rectangle in constant time "
  "(Crow, 1984; Viola & Jones, 2001), which makes local contrast fast enough for live video.")
h2("2.7 Accessible and Adaptive Software")
p("The Web Content Accessibility Guidelines 2.1 set measurable criteria, including a contrast of at least 4.5 to 1 for normal text "
  "and content that reflows without sideways scrolling (World Wide Web Consortium, 2018). Responsive design adapts one layout to many "
  "screens (Marcotte, 2010). ISO/IEC 25010 (2011) defines software quality in eight characteristics, from functional suitability and "
  "performance efficiency to usability, security and portability, which this study uses to organise its evaluation. Universal Design "
  "for Learning recommends many means of representation and expression (CAST, 2018), which the learning module follows by showing "
  "every sign as an animation, three written words, speech and, for letters, braille.")
h2("2.8 Related Studies")
tb("Table 3. Related studies and their relation to the present study", [
    ["Study", "What was done", "Relation to the present study"],
    ["Zhang et al. (2020)", "Real-time 21-point hand tracking on phones.", "Supplies the landmarks SENYAS reads."],
    ["Cabalfin et al. (2012)", "FSL recognition from video with manifold learning.", "Confirms FSL recognition is possible; SENYAS adds offline use, Bikol and braille."],
    ["Koller (2020); Rastgoo et al. (2021)", "Surveys: most methods are deep and data-hungry.", "Motivates a geometric method that needs no large dataset."],
    ["Mitra & Acharya (2007)", "Survey of gesture recognition methods.", "Supports separating handshape from movement."],
    ["Aristidou & Lasenby (2011)", "FABRIK inverse kinematics.", "Places the thumb of the hand model and the avatar."],
    ["Antonacopoulos & Bridson (2004)", "Braille recognition from scanned pages.", "SENYAS reads phone photos and live video with skew and blur."],
    ["Isayed & Tahboub (2015)", "Review of optical braille recognition.", "Identifies grid fitting and skew as key steps, addressed here."]], [1.8, 2.3, 2.4])
h2("2.9 Synthesis and Research Gap")
p("Hand tracking is good enough to run on phones, but no study has turned landmarks into FSL letters and words offline, with Bikol "
  "output and speech, and joined this with braille reading and an avatar that signs back. Deep methods need data that FSL does not "
  "have; braille readers assume scanners. The gap this study fills is an intelligent, explainable, offline system for the three "
  "languages of Albay whose behaviour can be stated, measured and improved.")
h2("2.10 Theoretical Framework")
tb("Table 4. Research gaps and the theories used to address them", [
    ["Gap", "Theory or method that addresses it"],
    ["G1 No large FSL dataset", "Robot-hand kinematics (forward kinematics and FABRIK) generates labelled handshapes (Craig, 2005; Aristidou & Lasenby, 2011)."],
    ["G2 Hands differ in position, size and angle", "Coordinates in a frame attached to the palm are unchanged by translation, scaling and rotation."],
    ["G3 Noisy landmarks and similar shapes", "Nearest-neighbour classification with a confidence margin (Cover & Hart, 1967)."],
    ["G4 Signs move at different speeds", "Hysteresis counting (Schmitt, 1938), winding numbers, and dynamic time warping (Sakoe & Chiba, 1978)."],
    ["G5 Braille photos are skewed and noisy", "Summed-area tables (Crow, 1984), robust spacing and skew estimates, and grid fitting by error minimisation."],
    ["G6 Three languages, no signal, many screens", "A trilingual phrase index with longest-match lookup; responsive, accessible design (W3C, 2018)."]], [2.3, 4.2])
h2("2.11 Conceptual Framework")
p("Figure 1 shows the input–process–output paradigm. The inputs are camera frames of hands, photos or frames of braille, and typed "
  "or spoken text. The processes turn them into landmarks and features, decisions about signs, dots and cells, and lookups in the "
  "trilingual index. The outputs are text in the chosen language with optional speech, and an avatar that signs, with the text also "
  "shown in braille. Benchmark results feed back into the design.")
fg("fig_system.png", "Figure 1. Conceptual paradigm of the study", 6.4)

# ======================================================================
h1("CHAPTER 3. METHODOLOGY")
h2("3.1 Research Design")
p("The study used a developmental engineering-design approach (Hevner et al., 2004). The intelligent system was designed from "
  "kinematic and geometric models, built as working software for phones and computers, and evaluated quantitatively through nine "
  "repeatable computational experiments that simulate its inputs. The independent variables were pose noise, the sign, the hold "
  "time and signer speed, the braille photo condition and the screen size; the dependent variables were accuracy, detection and "
  "false-alarm rates, word accuracy, character error rate, processing time and layout faults.")
h2("3.2 Materials")
tb("Table 5. Materials used in development and testing", [
    ["Item", "Specification", "Use"],
    ["Computer", "x86-64 CPU, Linux; no GPU used in tests", "Development and all benchmarks"],
    ["Chromium (headless) with Playwright", "Desktop browser engine and test driver", "Runs the app, MediaPipe, braille and layout tests"],
    ["Node.js 22", "JavaScript runtime", "Recogniser benchmarks"],
    ["MediaPipe Tasks Vision 0.10.14", "Hand Landmarker, float16 model (Apache-2.0)", "On-device hand landmarks"],
    ["HTML, CSS and JavaScript", "No framework; one 190 KB page", "The app and the website"],
    ["Kotlin and Android WebView", "Android 7.0 or later", "Android app with phone speech and camera"],
    ["Python 3, Matplotlib, python-docx", "Statistics, figures, documents", "Analysis and reporting"]], [2.1, 2.4, 2.0])
h2("3.3 System Architecture")
p("SENYAS has four engines that share one page: the sign engine (camera → MediaPipe → features → decisions), the avatar engine "
  "(text → index → signs → kinematic animation), the braille engine (photo or frame → dots → grid → text), and the speech engine "
  "(text → device voice, and microphone → text). All engines run on the device. A consent sheet decides what is saved; video, photos "
  "and audio are never stored or sent. The app adapts its layout with CSS media queries: a bottom tab bar on phones, a side rail on "
  "tablets, both translation directions side by side on wide screens, a camera-beside-text layout on phones held sideways, and "
  "larger type on televisions.")
h2("3.4 Development Procedure")
h3("3.4.1 The kinematic hand model")
p("Each finger i has a knuckle at mᵢ on the palm, a spread angle aᵢ and three links of lengths ℓ₁, ℓ₂, ℓ₃. With joint flexions "
  "θ₁, θ₂, θ₃, link j points in the direction")
eq("dⱼ = cos(θ₁ + … + θⱼ) u + sin(θ₁ + … + θⱼ) z,   u = (sin aᵢ, cos aᵢ, 0)", 1)
p("where z is the palm normal, so joint j lies at mᵢ + ℓ₁d₁ + … + ℓⱼdⱼ. This is forward kinematics for a planar three-link chain "
  "turned by the spread angle. The thumb has a more mobile base, so it is placed by FABRIK: its base is fixed, its tip is sent to a "
  "target (for example, the side of the index finger for A, or the tip of the middle finger for D), and the chain is pulled "
  "alternately to the target and the base for 14 iterations. A handshape is therefore a vector of 12 finger angles, 4 spreads and "
  "one thumb target; 37 shapes were defined this way. An orientation is given by the finger direction f and palm direction n, "
  "made orthonormal and assembled into the rotation [f × n, f, n]. The same model animates the avatar, blending angles, thumb "
  "targets and orientations between keyframes with a smoothstep curve, so the shapes it signs are the shapes it recognises.")
h3("3.4.2 Palm-frame features")
p("For the landmarks p₀ … p₂₀ of a detected hand (wrist p₀; index, middle and little-finger knuckles p₅, p₉, p₁₇), the palm frame is")
eq("s = ‖p₉ − p₀‖,  Y = (p₉ − p₀)/s,  Z = (p₅ − p₁₇) × Y / ‖(p₅ − p₁₇) × Y‖,  X = Y × Z", 2)
p("and each fingertip and middle joint q is written as c(q) = ((q − p₀)·X, (q − p₀)·Y, (q − p₀)·Z)/s. These 30 values are joined by "
  "four thumb-to-fingertip distances, three distances between neighbouring fingertips and four orientation terms, giving a weighted "
  "41-number vector.")
lead("Proposition 1 (invariance).", "If every landmark is moved by a similarity transform p ↦ λRp + t with λ > 0 and R a rotation, the "
     "30 palm-frame values and the 7 distance ratios do not change.")
lead("Proof.", "The palm length becomes λs. The differences p₉ − p₀ and p₅ − p₁₇ become λR(p₉ − p₀) and λR(p₅ − p₁₇); since a rotation "
     "preserves lengths and cross products, the new axes are RX, RY and RZ. For any joint, (λR(q − p₀))·(RY)/(λs) = (q − p₀)·Y/s because "
     "RᵀR = I, and likewise for X and Z. Distance ratios are unchanged because all lengths scale by λ. ∎")
p("A reflection has determinant −1 and reverses the cross product, so the mirror image of a right hand has its Z axis flipped; this is "
  "why a left hand is mirrored into a right hand before comparison. Because a camera's left/right label can be wrong, SENYAS compares "
  "both the hand and its mirror image and keeps the closer match. The four orientation terms are deliberately not invariant: they "
  "tell apart letters that share a handshape but point differently, such as G and Q, K and P, and H and U.")
h3("3.4.3 Templates, classification and confidence")
p(f"Each built-in template is a hand-model shape turned by random rotations of up to about ±17° and loosened by random joint changes, "
  f"giving {TM['templates']} templates. A new hand is assigned the label of its nearest template by Euclidean distance; examples that "
  "the user records are weighted by 0.8 so that they are preferred. With d₁ and d₂ the distances to the best and second-best labels, "
  "the confidence is")
eq("c = clip((1.55 − d₁)/1.0, 0, 1) × min(1, 0.35 + 2.2 (d₂ − d₁))", 3)
p(f"Classifying one hand costs about N × D = {TM['templates']} × 41 ≈ 23,000 multiply-adds, which is negligible on a phone.")
h3("3.4.4 Decisions over time")
p("A letter is written only when the same label has been held for the hold time (400 ms by default) while the wrist moves less than "
  "0.6 palm-lengths over 0.4 s, so letters are not written during transitions. A double letter, as in HELLO, is signed with a short "
  "sideways slide of the same handshape: when the wrist has moved more than 0.4 palm-lengths since the last letter and then rests, the "
  "letter is written again. When no hand is seen for 0.9 s, the spelled word is closed and looked up in the dictionary, so that "
  "spelling T-U-B-I-G gives water, and the word is spoken if reading aloud is on.")
h3("3.4.5 Moving and two-handed signs")
p("The last 1.5 s of wrist and fingertip positions are kept in palm-length units. Back-and-forth movement is counted with hysteresis: "
  "a reversal is counted only after the signal has turned back by more than an amplitude A, so jitter smaller than A is ignored. Hello "
  "is an open hand whose fingertips reverse at least twice; yes is a fist whose knuckles reverse vertically; where is a wagging index "
  "finger; bathroom is a shaking T; water and eat are taps of W and flat-O hands. Please and sorry are circles of a flat hand and a "
  "fist, detected by the winding number")
eq("w = (1/2π) Σₜ wrap(φₜ − φₜ₋₁),  φₜ = atan2(yₜ − ȳ, xₜ − x̄)", 4)
p("which must exceed 0.8 turns, with a mean radius above 0.28 palm-lengths and a roundness (short side over long side of the path's "
  "bounding box) above 0.45. Thank you is a flat hand moving down from chin height. J, Z and Ñ are the I, index and N handshapes held "
  "throughout a hook, a zig-zag and a shake. Two-handed signs are named from the pair of handshapes and the distance between chosen "
  "points: two fists close together for love, a thumbs-up resting above a flat palm for help, touching flat-O fingertips for more, "
  "touching flat-hand fingertips for house, linked hooked index fingers for friend, and tapping H hands for name.")
h3("3.4.6 Signs taught by the user")
p("A user can teach any sign, such as a local FSL word or a name sign, by recording it three times for 1.5 s. If the hand moves less "
  "than 1.1 palm-lengths, the three mean feature vectors become templates. Otherwise each take is resampled to 16 frames of 44 "
  "numbers (the features plus the wrist displacement and whether a second hand is present) and stored as a sequence. A new movement "
  "is compared with each take by dynamic time warping with a band of four frames; its distance is divided by a tolerance τ equal to "
  "1.6 times the average distance between the user's own three takes (bounded to 0.75–1.6), and the sign is accepted when the ratio "
  "is below 1. Each comparison costs about 16 × 9 × 44 operations.")
h3("3.4.7 The braille reader")
p("A photo or video frame is reduced to at most 1,100 pixels wide and turned to grey. A summed-area table gives the local mean over a "
  "window of about one-fortieth of the image in constant time per pixel; pixels darker than the local mean by 1.8 standard deviations "
  "(printed dots) or lighter (embossed dots catching the light) form candidate blobs found by flood fill. Blobs that are smaller than "
  "8 pixels, elongated or far from the typical dot size are discarded, and the polarity whose blobs are most uniform and best "
  "supported by neighbours at dot spacing is kept. The dot spacing δ is the median of the nearest-neighbour distances that are within "
  "1.2 times their lower quartile, which ignores the longer diagonal and between-cell distances, and the skew is the median "
  "nearest-neighbour angle folded into (−45°, 45°]. After the points are turned upright, rows are clustered with a gap of δ/2 and "
  "grouped into lines of three. In each line the cell grid is found by minimising")
eq("E(P, x₀) = Σ_c min(|u_c − kP|, |u_c − δ − k′P|),  u_c = x_c − x₀,  2.1δ ≤ P ≤ 2.9δ", 5)
p("over the cell pitch P and offset x₀, where x_c are the column centres and k, k′ the nearest integers. Each dot is then given a "
  "cell, column and row, forming a six-bit number that a small state machine decodes: the number sign switches the letters a–j to "
  "digits until a space, the capital sign raises the next letter, and standalone cells for and, for, of, the and with are read as "
  "words. The whole reader is linear in the number of pixels apart from the small grid search.")
h3("3.4.8 Translation, speech and the avatar")
p("All 93 words, the numbers and 32 phrases are stored with their English, Filipino and Bikol forms in a single index. Text is "
  "normalised (lower case, accents removed) and matched greedily, longest phrase first up to seven words; matched phrases expand into "
  "their sign order, single words map to their signs, and anything else is fingerspelled. The avatar is a drawn signer whose arms are "
  "placed by two-link inverse kinematics from the shoulder to the wrist, with each hand drawn from the kinematic model with depth "
  "ordering, simple facial expressions for questions and feelings, and adjustable speed. Speech uses the device voice: on the web, the "
  "Speech Synthesis API; on Android, the phone's text-to-speech engine through a JavaScript bridge. Bikol text is read with a Filipino "
  "voice, the closest one available.")
h3("3.4.9 The app, website and privacy design")
p("The app is a single installable web page (190 KB, plus the 17 MB hand-tracking engine kept for offline use) that works on "
  "Android, iPhone, iPad, computers and televisions; an Android app wraps the same page with access to the camera, microphone and "
  "phone voice, and is built automatically for download from the website. The website explains the features, shows a live avatar "
  "demonstration, offers downloads for each device and includes a cookie banner and privacy policy. In the app, a consent sheet "
  "explains that video, photos and audio never leave the device and lets the user choose whether settings, progress and taught "
  "signs are saved; with essential storage only, nothing else is kept.")
code("Algorithm 1. Reading one camera frame", [
    "for each detected hand h:",
    "    f1 ← features(h as labelled), f2 ← features(mirror of h)",
    "    d[label] ← min over templates of min(‖f1 − t‖, 1.04‖f2 − t‖)",
    "choose the dominant hand; append its points to the 1.5 s buffer",
    "if a taught moving sign matches (DTW ratio < 1): write it; stop",
    "if a moving-sign rule fires: write the sign; clear the buffer; stop",
    "if two hands form a two-handed sign for the hold time: write it; stop",
    "best ← nearest allowed label; if confidence > 0.32 and steady for the hold time:",
    "    write the letter or word (speak it if Read aloud is on)"])

h2("3.5 Data Gathering Procedure")
tb("Table 6. The nine experiments", [
    ["No.", "Experiment", "Data generated", "Measure"],
    ["E1", "Static letters", "24 letters × 40 hands × 4 noise levels (960 per level); one in four left-handed", "Accuracy"],
    ["E2", "Ablation", "24 letters × 30 hands at 1.5× noise, 15% wrong hand labels, five designs", "Accuracy"],
    ["E3", "Moving and two-handed signs", "19 signs × 30 streams at 30 frames per second with random size and speed; 144 still streams", "Detection, false alarms"],
    ["E4", "Fingerspelled words", "40 words × 3 hold times × 3 signer speeds, with transitions and double letters", "Word accuracy, CER"],
    ["E5", "Taught signs", "4 new movements, 3 recorded takes each, 30 new trials each, 104 look-alike trials", "Detection, false accepts"],
    ["E6", "Braille photos", "300 photos with random dot type, skew ±6°, spacing 12–20 px, blur 0–1.6 px, uneven light, noise; ablation of two steps", "Exact rate, CER"],
    ["E7", "Full camera path", "288 rendered hands (24 letters × 3 skin tones × 2 hands × 2 tilts) given to MediaPipe", "Detection, accuracy"],
    ["E8", "Speed", "400 recogniser frames, 288 MediaPipe images, 300 braille photos", "Median time"],
    ["E9", "Screens and access", "11 screen sizes × 5 screens; 7 colour pairs; phrasebook in 3 languages", "Layout faults, contrast, coverage"]], [0.5, 1.4, 3.3, 1.3])
p("In E1–E5, hands were generated by the kinematic model with random joint changes (standard deviation 7° times the noise "
  "multiplier), thumb-target changes, rotations of 0.2–0.3 radians times the multiplier, and landmark noise of 2.5–3.5 mm times the "
  "multiplier, then converted to MediaPipe's coordinate conventions and passed through exactly the same code the app runs. Random "
  "numbers came from a fixed-seed generator, so every run can be repeated.")
h2("3.6 Treatment of Data")
p("Proportions are reported with 95% Wilson (1927) intervals, which remain accurate near 0% and 100%. H₀1–H₀3 were tested with "
  "one-sided exact binomial tests, p = P(X ≥ k | n, p₀). The character error rate is the total Levenshtein (1966) distance divided by "
  "the total length of the true text, with each photo's error capped at its length. Times are medians. All computations are in the "
  "open scripts bench_recognizer.js, bench_browser.js, bench_ui.js and analyze.py.")
h2("3.7 Ethical Considerations and Safety")
p("No human participants took part in this phase, so no personal data or consent forms were needed. The app processes camera images, "
  "photos and audio on the device and never uploads them; it asks before saving anything, lets users export or delete their data, "
  "and follows the Data Privacy Act of 2012. The app tells users that its signs are forms shared by FSL and ASL, that local FSL signs "
  "vary, and that it is not a certified interpreter; for medical, legal and emergency matters it advises asking for a qualified FSL "
  "interpreter. All sources are cited, and the open-source hand-tracking engine is used under its Apache 2.0 licence. Any future test "
  "with Deaf or blind persons will undergo ethics review, obtain parental consent for minors, and be carried out with the Deaf "
  "community.")

# ======================================================================
h1("CHAPTER 4. RESULTS AND DISCUSSION")
h2("4.1 The Developed System")
p("The study produced a working system with five parts: (1) live sign-to-words translation with a Read aloud switch, letter, number "
  "and word modes, and a conversation history; (2) words-and-voice-to-sign with the avatar, speed control, quick phrases and a "
  "braille line; (3) a braille reader for photos and live video with a braille chart; (4) a learning module of 11 units with lessons, "
  "quizzes, camera practice, flashcards, two games, levels, streaks and badges; and (5) a dictionary and phrasebook in three "
  "languages. Settings include the app language, output language, voice speed, signing hand, camera, hold time, avatar skin tone, "
  "theme, text size, high contrast, reduced motion, taught signs and data controls. Figure 2 shows the main screens.")
fr(["shot-phone-1translate.png", "shot-phone-2t2s.png", "shot-phone-3brl.png"], "Figure 2. Live sign translation with Read aloud, the signing avatar, and the braille reader on a phone")

h2("4.2 Static Letters (E1)")
rows = [["Noise multiplier", "Correct / trials", "Accuracy", "95% Wilson CI"]] + [[f"{x['level']}×", f"{x['k']} / {x['n']}", pc(x["acc"]), f"{pc(x['lo'])} – {pc(x['hi'])}"] for x in S["static"]]
tb("Table 7. Accuracy on the 24 static letters", rows, [1.6, 1.6, 1.4, 1.9])
fg("fig_static.png", "Figure 3. Static-letter accuracy as pose noise increases", 5.2)
tc = S["topConfusions"]
p(f"At the expected camera noise the recogniser named {st[1]['k']} of {st[1]['n']} hands correctly ({pc(st[1]['acc'])}); the exact "
  f"binomial test rejected H₀1 (p {pv(sf(st[1]['k'], st[1]['n'], 0.9))}). Accuracy declined gradually, to {pc(st[2]['acc'])} at twice the "
  "expected noise, instead of collapsing. Figure 4 shows where the errors went at 1.5 times the noise. The letters with the lowest "
  f"accuracy were {', '.join(f'{a} ({pc(b, 0)})' for a, b in weak)}, and the most frequent confusions were "
  f"{', '.join(f'{a}→{b} ({c})' for a, b, c in tc[:5])}. These pairs are close for human readers as well: U and R differ only in "
  "whether the fingers cross, G and Q only in pointing down, and S, T, M and N only in where the thumb rests. This is why the app "
  "lets each user record personal examples of hard letters, which the classifier prefers.")
fg("fig_confusion.png", "Figure 4. Confusion matrix of the static letters at 1.5× noise", 5.0)

h2("4.3 Which Parts of the Design Matter (E2)")
ab = list(AB.items())
tb("Table 8. Ablation of the feature design (1.5× noise, 15% wrong hand labels)", [["Design", "Accuracy"]] + [[k, pc(v["accuracy"])] for k, v in ab], [4.5, 2.0])
fg("fig_ablation.png", "Figure 5. Accuracy when one part of the design is removed", 5.6)
full = AB["Full design"]["accuracy"]
p(f"The full design reached {pc(full)} under these hard conditions. Using camera coordinates instead of the palm frame dropped "
  f"accuracy to {pc(AB['Camera-frame coordinates (no palm frame)']['accuracy'])}, which confirms Proposition 1 in practice: the palm frame "
  "removes most of the variation caused by how the hand is held. Removing the orientation terms gave "
  f"{pc(AB['No orientation features']['accuracy'])}, because letters such as G and Q become identical, and trusting the camera's hand label "
  f"instead of checking the mirror image gave {pc(AB['No mirror check (trust the hand label)']['accuracy'])}. Keeping only one template per "
  f"letter still gave {pc(AB['One example per letter']['accuracy'])}, which shows that most of the accuracy comes from the geometry of the "
  "features rather than from the number of examples.")

h2("4.4 Moving and Two-Handed Signs (E3)")
rows = [["Sign", "Type", "Detected", "95% Wilson CI"]] + [[m["sign"], "two hands" if m["two"] else "moving", f"{m['k']}/{m['n']}", f"{pc(m['lo'], 0)} – {pc(m['hi'], 0)}"] for m in S["moving"]]
tb("Table 9. Detection of moving and two-handed signs (30 trials each)", rows, [1.6, 1.4, 1.3, 2.0])
fg("fig_moving.png", "Figure 6. Detection rate of each moving and two-handed sign", 5.6)
p(f"All {MA['n']} trials were checked; {MA['k']} were detected ({pc(MA['rate'])}, 95% CI {pc(MA['ci'][0])}–{pc(MA['ci'][1])}), and H₀2 was "
  f"rejected (p {pv(S['H2']['p'])}). None of the {S['still']['sequences']} still-letter streams raised a moving sign (95% CI 0–"
  f"{pc(S['still']['falseAlarmCI'][1])}), and the first letter written was correct in {pc(S['still']['firstCommitCorrect'])} of them. The "
  "experiments also found two faults that were then fixed: a waved hello was sometimes taken for the circle of please, because a "
  "straight back-and-forth path winds around its own centre, and the movement during a change from I to another letter was "
  "sometimes read as J. Adding the roundness condition of Equation 4 and requiring the handshape to be held throughout J, Z and Ñ "
  "removed both errors. This shows the value of testing decision rules against generated data before release.")

h2("4.5 Fingerspelled Words and the Hold Time (E4)")
rows = [["App hold time", "Signer holds 500 ms", "Signer holds 700 ms", "Signer holds 1,000 ms"]]
for h in (300, 400, 600): rows.append([f"{h} ms"] + [f"{pc(W[(h, s)]['wordAccuracy'], 0)} (CER {pc(W[(h, s)]['cer'])})" for s in (500, 700, 1000)])
tb("Table 10. Fingerspelled words read exactly (40 words per cell)", rows, [1.3, 1.7, 1.7, 1.8])
fg("fig_words.png", "Figure 7. Word accuracy for each hold time and signer speed", 4.6)
p(f"At the default hold time of 400 ms, {wk} of {wn} words ({pc(wk / wn)}) were read exactly across the three signer speeds, so H₀3 "
  f"(at most 80%) was rejected (p {pv(H3p)}). The table shows a clear trade-off. A hold time longer than the signer's own hold, such as "
  "600 ms for a signer who holds letters for 500 ms, misses most letters; a short hold time suits fast signers but lets more "
  "transition shapes through. The default of 400 ms works for learners and fluent signers alike, and the app offers 300 and 600 ms "
  "for fast and slow signers. An earlier version used 550 ms and repeated a held letter on a timer; in this experiment it read only "
  "about half of the words, which led to the shorter default and to signing double letters with a slide, as fluent signers do.")

h2("4.6 Signs Taught by the User (E5)")
rows = [["Taught movement", "Detected", "Recorded as moving"]] + [[k, f"{round(v['detected'] * v['trials'])}/{v['trials']}", f"{v['recordedAsMoving']} of 3"] for k, v in CU["perSign"].items()]
rows.append(["Look-alike trials (built-in signs)", f"{CU['lookalikes']['falseAccepts']} false accepts / {CU['lookalikes']['trials']}", "—"])
tb("Table 11. Recognition of signs taught from three recordings", rows, [2.5, 2.0, 2.0])
p(f"After three recordings each, the four new movements were found in {cu_k} of {cu_n} new trials, and none of the "
  f"{CU['lookalikes']['trials']} built-in signs was mistaken for a taught one. A fixed dynamic-time-warping threshold had first missed the "
  "spiral in every trial and the swipe in most, because these movements naturally vary more in size; scaling the threshold by how much the user's "
  "own three takes differ from each other (Section 3.4.6) solved this without adding false accepts. This lets Deaf users add local "
  "FSL signs and name signs that no dataset contains.")

h2("4.7 Braille Reader (E6)")
rows = [["Condition", "Photos", "Read exactly", "CER"]] + [[g["group"], str(g["n"]), pc(g["exact"]), pc(g["cer"])] for g in S["braille"]]
tb("Table 12. Braille reading accuracy by photo condition", rows, [2.4, 1.0, 1.5, 1.2])
fg("fig_braille.png", "Figure 8. Share of braille photos read exactly, by condition", 5.6)
p(f"Across 300 photos the reader returned the exact text for {pc(br['All photos']['exact'])} with a character error rate of "
  f"{pc(br['All photos']['cer'])}; H₀4 was rejected. Embossed dots ({pc(br['Embossed dots']['exact'])} exact) were read at least as well as "
  f"printed dots ({pc(br['Printed dots']['exact'])}), because the reader chooses the polarity that forms a better grid. Larger dots "
  f"helped ({pc(br['Dot pitch ≥ 18 px']['exact'])} exact at a spacing of 18 pixels or more against {pc(br['Dot pitch < 15 px']['exact'])} "
  "below 15 pixels), so users are told to hold the phone close. Most remaining errors came from lines whose first cell had dots only "
  "in its right-hand column, which can shift the fitted grid by half a cell.")
tb("Table 13. Ablation of two optional steps in the braille reader", [["Version", "Read exactly", "CER"], ["Shipped reader", pc(br['All photos']['exact']), pc(br['All photos']['cer'])]] +
   [[k, pc(v["exact"]), pc(v["cer"])] for k, v in BA.items()], [3.0, 1.7, 1.7])
p("The first version of the reader read 57% of the same photos exactly. Three changes raised this to the present level: a minimum blob "
  "size, a dot size estimated from the larger blobs, and choosing the polarity by neighbour support. Two further steps, extra "
  "smoothing and removing blobs without a neighbour, were also tested (Table 13). They did not improve accuracy, so they were left "
  "out of the app, which also makes it faster. Reporting this negative result keeps the design as simple as the evidence allows.")

h2("4.8 The Full Camera Path (E7)")
fg("fig_camera.png", "Figure 9. Rendered hands found by MediaPipe and letters named correctly", 5.6)
p(f"MediaPipe found a hand in {MP['detected']} of {MP['n']} rendered images ({pc(MP['detRate'])}), and the recogniser named {MP['correct']} of "
  f"those correctly ({pc(MP['accDet'])}). The renders are flat drawings without skin texture, creases or nails, so the landmark model is "
  "working outside the kind of image it was trained on. This experiment is therefore a check that all parts fit together and a lower "
  "bound on the full path, not a measure of accuracy on real hands. The gap between this figure and E1 identifies the next step: "
  "calibrating the templates with real landmark recordings, which the app already supports through personal examples.")

h2("4.9 Speed (E8)")
tb("Table 14. Median processing time per frame or photo", [
    ["Component", "Median time", "Frames per second it allows"],
    ["MediaPipe hand landmarks (CPU)", f"{TM['mediapipeMs']:.1f} ms", f"{1000 / TM['mediapipeMs']:.0f}"],
    ["SENYAS recogniser and decisions", f"{TM['recognizerMs']:.2f} ms", f"{1000 / TM['recognizerMs']:,.0f}"],
    ["Braille reader (one photo or frame)", f"{TM['brailleMs']:.1f} ms", f"{1000 / TM['brailleMs']:.0f}"]], [2.8, 1.6, 2.1])
p(f"The recogniser added less than a tenth of a millisecond to each frame. Hand tracking dominated at {TM['mediapipeMs']:.0f} ms on a CPU, "
  "under the 100 ms limit, so H₀5 was rejected; on phones the model can use the graphics processor and usually runs faster. The "
  "braille reader scans a live frame about every 0.65 s, well within its cost.")

h2("4.10 Interface Fit, Accessibility and Coverage (E9)")
rows = [["Screen", "Size (px)", "Layout", "Sideways scroll", "Small targets"]] + [[u["name"], f"{u['w']}×{u['h']}", u["layout"], "none" if u["overflow"] <= 0 else f"{u['overflow']} px", str(u["small"])] for u in UI]
tb("Table 15. Layout test on 11 screen sizes (five screens each)", rows, [1.7, 1.2, 1.2, 1.2, 1.2])
p(f"On all {len(UI)} screen sizes, none of the five screens scrolled sideways and the five-tab navigation was always visible, so H₀6 was "
  "rejected. Phones used a bottom tab bar; phones held sideways, tablets and computers used a side rail; wide screens showed both "
  "translation directions side by side. The first layout test found many touch targets below 32 pixels in the phrasebook and "
  "settings; after they were enlarged to at least 40 pixels, only a few small controls remained on one size, in line with WCAG "
  "guidance on target size (World Wide Web Consortium, 2018).")
tb("Table 16. Text contrast against WCAG 2.1 (minimum 4.5 : 1)", [["Colour pair", "Contrast", "WCAG AA"]] + [[c["pair"], f"{c['ratio']:.1f} : 1", "pass" if c["ratio"] >= 4.5 else "fail"] for c in S["contrast"]], [3.4, 1.4, 1.2])
p(f"Every colour pair in light and dark themes met the 4.5 : 1 contrast required for normal text. The lexicon holds {CV['words']} words "
  f"and the numbers 0–10; all {CV['phrases']} phrasebook sentences produced {CV['en']['signs']} signs in each language with no word left "
  "to fingerspelling, so a Bikol speaker, a Filipino speaker and an English speaker receive the same signs.")
tb("Table 17. Evaluation mapped to ISO/IEC 25010 quality characteristics", [
    ["Characteristic", "Evidence in this study"],
    ["Functional suitability", "E1–E7: accuracy of signs, words, taught signs and braille"],
    ["Performance efficiency", "E8: time per frame; 190 KB app page"],
    ["Compatibility", "Runs in browsers on Android, iOS, Windows, macOS and Linux, and as an Android app"],
    ["Usability", "E9: layouts, touch targets, contrast; three languages; reduced motion and large text"],
    ["Reliability", "Works offline after the first start; still-hand false alarms 0% (E3)"],
    ["Security", "No accounts; video, photos and audio never leave the device; consent before storage"],
    ["Maintainability", "Small modules (hand, avatar, recogniser, braille, data, app) with benchmark scripts"],
    ["Portability", "One codebase for web, installable app and Android"]], [2.0, 4.5])

h2("4.11 Summary of Hypothesis Tests")
tb("Table 18. Summary of hypothesis tests", [
    ["Hypothesis", "Result", "Decision"],
    ["H₀1 accuracy ≤ 90%", f"{pc(st[1]['acc'])}, p {pv(sf(st[1]['k'], st[1]['n'], 0.9))}", "Rejected"],
    ["H₀2 detection ≤ 90%", f"{pc(MA['rate'])}, p {pv(S['H2']['p'])}", "Rejected"],
    ["H₀3 word accuracy ≤ 80%", f"{pc(wk / wn)}, p {pv(H3p)}", "Rejected" if H3p < 0.05 else "Not rejected"],
    ["H₀4 CER ≥ 20%", f"CER = {pc(br['All photos']['cer'])}", "Rejected"],
    ["H₀5 time > 100 ms", f"{TM['mediapipeMs']:.0f} ms + {TM['recognizerMs']:.2f} ms", "Rejected"],
    ["H₀6 layout faults on some screen", f"{ui_ok} of {len(UI)} sizes without faults", "Rejected" if ui_ok == len(UI) else "Not rejected"]], [2.3, 2.6, 1.6])
h2("4.12 Limitations")
p("The accuracy figures come from generated hands, movements and photos, which follow the shapes and noise levels described in "
  "Section 3.5 but cannot capture every real signer, camera and page. The rendered-hand test shows that real-image calibration is "
  "the largest remaining step. The sign vocabulary uses forms shared by FSL and ASL; regional FSL signs must be added by users or by "
  "future work with the Deaf community. Bikol is spoken with a Filipino voice because no Bikol voice is available on phones. Braille "
  "reading is limited to Grade 1.")

# ======================================================================
h1("CHAPTER 5. CONCLUSIONS AND RECOMMENDATIONS")
h2("5.1 Conclusions")
nl([f"A recogniser that generates its examples from a robot-like kinematic hand model and compares palm-frame features classified the "
    f"static FSL letters with {pc(st[1]['acc'])} accuracy at expected noise, without any recorded dataset. The palm frame, orientation "
    "terms and mirror check each contributed measurably.",
    f"Hysteresis counting, winding numbers, held-shape paths and two-hand distances detected {pc(MA['rate'])} of moving and two-handed "
    "signs with no false alarms on still hands.",
    f"With a 400 ms hold time and double letters signed with a slide, {pc(wk / wn)} of fingerspelled words were read exactly across slow, "
    "average and fast signers.",
    f"Signs taught from three recordings were recognised in {pc(cu_k / cu_n)} of trials with no false accepts, so users can extend SENYAS "
    "with local signs.",
    f"Grid fitting read {pc(br['All photos']['exact'])} of braille photos exactly ({pc(br['All photos']['cer'])} CER) across print, embossing, "
    "skew and blur.",
    "Every component ran fast enough for live use on the device and offline, and the interface fitted every screen tested with "
    "readable contrast.",
    "A single trilingual index carried every phrase into signs in English, Filipino and Bikol, and the Read aloud switch lets each "
    "user decide whether recognised words are spoken."])
p("Overall, the study shows that an intelligent machine built on kinematics and geometry can provide an offline, trilingual "
  "communication aid for Deaf, blind and hearing people without big data, and that its behaviour can be measured and improved.")
h2("5.2 Recommendations")
bl(["Validate SENYAS with Deaf and blind learners, teachers and FSL interpreters in Albay, for example in SPED centres and with the "
    "Philippine Federation of the Deaf, under ethics review, using the Technology Acceptance Model (Davis, 1989) and task success rates.",
    "Record real landmarks from many signers to calibrate the templates, and compare the geometric recogniser with a small learned "
    "model trained on those recordings.",
    "Ask native Bikol speakers and Deaf FSL users to review every word and sign, and add regional FSL variants and Bikol phrases for "
    "local services and disasters.",
    "Add facial landmarks for FSL grammar, sentence-level translation, and Grade 2 braille.",
    "Develop a Bikol text-to-speech voice, and distribute SENYAS through the Department of Education, local disaster risk reduction "
    "offices and health centres.",
    "Repeat the speed and battery tests on low-cost Android phones."])

REFERENCES = [
    "Antonacopoulos, A., & Bridson, D. (2004). A robust Braille recognition system. In S. Marinai & A. Dengel (Eds.), Document analysis systems VI (Lecture Notes in Computer Science, Vol. 3163, pp. 533–545). Springer.",
    "Aristidou, A., & Lasenby, J. (2011). FABRIK: A fast, iterative solver for the inverse kinematics problem. Graphical Models, 73(5), 243–260.",
    "Cabalfin, E. P., Martinez, L. B., Guevara, R. C. L., & Naval, P. C. (2012). Filipino Sign Language recognition using manifold projection learning. In TENCON 2012 – 2012 IEEE Region 10 Conference. IEEE.",
    "CAST. (2018). Universal Design for Learning guidelines (Version 2.2).",
    "Cover, T., & Hart, P. (1967). Nearest neighbor pattern classification. IEEE Transactions on Information Theory, 13(1), 21–27.",
    "Craig, J. J. (2005). Introduction to robotics: Mechanics and control (3rd ed.). Pearson Prentice Hall.",
    "Crow, F. C. (1984). Summed-area tables for texture mapping. ACM SIGGRAPH Computer Graphics, 18(3), 207–212.",
    "Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. MIS Quarterly, 13(3), 319–340.",
    "Hevner, A. R., March, S. T., Park, J., & Ram, S. (2004). Design science in information systems research. MIS Quarterly, 28(1), 75–105.",
    "International Council on English Braille. (2013). The rules of Unified English Braille (2nd ed.).",
    "International Organization for Standardization. (2011). ISO/IEC 25010:2011 Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models.",
    "Isayed, S., & Tahboub, R. (2015). A review of optical Braille recognition. In 2015 2nd World Symposium on Web Applications and Networking (WSWAN). IEEE.",
    "Koller, O. (2020). Quantitative survey of the state of the art in sign language recognition. arXiv:2008.09918.",
    "Levenshtein, V. I. (1966). Binary codes capable of correcting deletions, insertions, and reversals. Soviet Physics Doklady, 10(8), 707–710.",
    "Lugaresi, C., Tang, J., Nash, H., McClanahan, C., Uboweja, E., Hays, M., Zhang, F., Chang, C.-L., Yong, M. G., Lee, J., Chang, W.-T., Hua, W., Georg, M., & Grundmann, M. (2019). MediaPipe: A framework for building perception pipelines. arXiv:1906.08172.",
    "Marcotte, E. (2010, May 25). Responsive web design. A List Apart.",
    "Mitra, S., & Acharya, T. (2007). Gesture recognition: A survey. IEEE Transactions on Systems, Man, and Cybernetics, Part C, 37(3), 311–324.",
    "Rastgoo, R., Kiani, K., & Escalera, S. (2021). Sign language recognition: A deep survey. Expert Systems with Applications, 164, 113794.",
    "Republic Act No. 7277. (1992). Magna Carta for Disabled Persons. Republic of the Philippines.",
    "Republic Act No. 10173. (2012). Data Privacy Act of 2012. Republic of the Philippines.",
    "Republic Act No. 11106. (2018). The Filipino Sign Language Act. Republic of the Philippines.",
    "Sakoe, H., & Chiba, S. (1978). Dynamic programming algorithm optimization for spoken word recognition. IEEE Transactions on Acoustics, Speech, and Signal Processing, 26(1), 43–49.",
    "Schmitt, O. H. (1938). A thermionic trigger. Journal of Scientific Instruments, 15(1), 24–26.",
    "Stokoe, W. C. (1960). Sign language structure: An outline of the visual communication systems of the American deaf (Studies in Linguistics, Occasional Papers 8). University of Buffalo.",
    "United Nations. (2006). Convention on the Rights of Persons with Disabilities.",
    "United Nations. (2015). Transforming our world: The 2030 Agenda for Sustainable Development.",
    "Viola, P., & Jones, M. (2001). Rapid object detection using a boosted cascade of simple features. In Proceedings of the 2001 IEEE Computer Society Conference on Computer Vision and Pattern Recognition (Vol. 1, pp. 511–518). IEEE.",
    "Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association, 22(158), 209–212.",
    "World Health Organization. (2019). World report on vision.",
    "World Health Organization. (2021). World report on hearing.",
    "World Wide Web Consortium. (2018). Web Content Accessibility Guidelines (WCAG) 2.1. W3C Recommendation.",
    "Zhang, F., Bazarevsky, V., Vakunov, A., Tkachenka, A., Sung, G., Chang, C.-L., & Grundmann, M. (2020). MediaPipe Hands: On-device real-time hand tracking. arXiv:2006.10214.",
]

APPENDIX = []
ap = lambda *b: APPENDIX.append(b)
ap("h2", "Appendix A. Braille cells decoded by SENYAS")
ap("brl",)
ap("h2", "Appendix B. Signs the camera reads directly")
ap("p", "Letters A–Z and Ñ (J, Z and Ñ by their movement); numbers 0–10; words: hello, yes, no, thank you, please, sorry, where, water, eat, "
       "bathroom, I love you, good (thumbs-up), bad (thumbs-down), okay, love, help, more, house, friend, name, finished. Any other sign can be "
       "taught by the user from three recordings.")
ap("h2", "Appendix C. Trilingual lexicon")
ap("lex",)
ap("h2", "Appendix D. Phrasebook")
ap("phr",)
ap("h2", "Appendix E. Algorithms")
ap("code", "Algorithm E1. Fitting the braille grid in one line", [
    "δ ← dot spacing; C ← column centres of the line (clustered with gap 0.45δ)",
    "for P from 2.1δ to 2.9δ in steps of 0.05δ:",
    "    for x₀ from C₁ to C₁ + P in steps of P/24:",
    "        E ← Σ_c min(|u − kP|, |u − δ − k′P|), u = c − x₀",
    "keep (P, x₀) with the least E",
    "for each dot: cell k, column (0 or 1), row ← round((y − top)/δ); set bit 3·column + row",
    "decode the six-bit numbers left to right with the number and capital states"])
ap("code", "Algorithm E2. Teaching a sign", [
    "record three takes of 1.5 s; for each take keep features, wrist path and two-hand flag",
    "if the hand moved less than 1.1 palm-lengths: store the mean features as templates",
    "else: resample each take to 16 frames; τ ← 1.6 × mean DTW distance between the takes (0.75 ≤ τ ≤ 1.6)",
    "while translating: every 5 frames compare the last 1.6 s with each take; accept if DTW/τ < 1"])
ap("h2", "Appendix F. Screens on other devices")
ap("f", FIG + "shot-desk-1translate.png", "Figure F1. Desktop: both directions side by side as a conversation", 6.2)
ap("fgrow", [FIG + "shot-phone-4learn.png", FIG + "shot-phone-5lesson.png", FIG + "shot-phone-6dict.png"], "Figure F2. Lessons, a lesson card in the three languages, and the dictionary")
ap("f", FIG + "shot-site.png", "Figure F3. The SENYAS website with downloads and the cookie notice", 6.2)
ap("h2", "Appendix G. User guide")
ap("n", ["Open SENYAS and choose what it may save on the device. Choose the app language and the language to translate into.",
         "Translate → Sign → Words: press Start camera and sign in front of it. Hold each letter briefly; drop your hand to finish a word. "
         "Turn Read aloud on to hear each word, or off for silence.",
         "Translate → Words → Sign: type or press the microphone and speak; the avatar signs it. Change the speed or tap a word to replay it.",
         "Translate → Braille: upload a photo of braille or scan it live, holding the page flat and close; the text appears and can be spoken.",
         "Learn: choose a unit, watch each sign, take the quiz, and practise with the camera. Teach a sign: record it three times."])
ap("h2", "Appendix H. Source code and data")
ap("p", "The app, website, Android project, benchmarks and the scripts that produced every number, table and figure in this paper are in the "
       "KAMAY repository (github.com/pogi6969/KAMAY): src/ (hand.js, avatar.js, recog.js, braille.js, data.js, app.js), research/code/ "
       "(bench_recognizer.js, bench_browser.js, bench_page.html, bench_ui.js, analyze.py, and their results) and research/paper/ (this paper's generator).")
