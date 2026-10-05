/* Original learning prompts aligned with OpenStax A&P 2e. Content: CC BY-NC-SA 4.0. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BodyguardCurriculum=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const chapters=[];
const book='https://openstax.org/books/anatomy-and-physiology-2e/pages/';
function add(id,title,mission,rows){
 const concepts=rows.trim().split('\n').map((line,i)=>{const [term,meaning,question,scenario]=line.split('|');return {id:`c${id}-${i+1}`,term,meaning,question,scenario,group:i<4?'Structure & identity':'Function & regulation'};});
 chapters.push({id,title,mission,unit:id<=4?1:id<=11?2:id<=17?3:id<=21?4:id<=26?5:6,source:`${book}${id}-chapter-review`,concepts});
}
add(1,'An Introduction to the Human Body','Orientation grid',`
Anatomy|Studies the structures of the body|Which discipline studies body structure?|A learner maps the shape of a heart chamber. Which discipline is being used?
Physiology|Studies how body parts function|Which discipline studies body function?|A learner measures how the heart pumps blood. Which discipline is being used?
Homeostasis|Maintains internal conditions within a regulated range|What describes regulation of the internal environment?|Temperature varies slightly but remains in a controlled range. What is being maintained?
Anatomical position|Upright stance with palms facing forward|What is the standard reference posture for anatomical descriptions?|Two diagrams use different poses. Which reference posture should their directional descriptions use?
Negative feedback|Opposes a deviation from a regulated value|Which feedback mechanism counteracts a disturbance?|Sweating increases as temperature rises and helps reduce that rise. Which mechanism is illustrated?
Positive feedback|Amplifies a change until a defined endpoint|Which feedback mechanism reinforces an ongoing change?|Cervical stretch promotes contractions that cause more stretch until birth. Which mechanism is illustrated?
Proximal|Closer to a limb's attachment to the trunk|Which term means closer to the attachment of a limb?|The elbow is closer to the shoulder than the wrist is. Which term describes the elbow relative to the wrist?
Sagittal plane|Divides the body into left and right portions|Which plane separates left and right portions?|A scan separates a body into left and right portions, not necessarily equal halves. Which plane is used?
`);
add(2,'The Chemical Level of Organization','Molecular workshop',`
Proton|Positively charged particle in an atomic nucleus|Which subatomic particle carries a positive charge?|An atom's atomic number changes when the number of which particle changes?
Electron|Negatively charged particle outside an atomic nucleus|Which subatomic particle carries a negative charge?|A neutral atom becomes a positive ion by losing which type of particle?
Covalent bond|A chemical bond involving shared electrons|Which bond forms when atoms share electrons?|Two atoms share electron pairs rather than transferring them. Which bond joins them?
Ionic bond|Attraction between oppositely charged ions|Which bond is an attraction between positive and negative ions?|An electron transfer creates a cation and an anion that attract. Which bond describes the attraction?
Buffer|Resists changes in pH by accepting or releasing hydrogen ions|What helps resist a sudden change in solution pH?|Small amounts of acid are added and pH changes only slightly. Which component could explain this resistance?
Enzyme|A biological catalyst that lowers activation energy|Which biological catalyst speeds a reaction?|A protein speeds a reaction without being used up overall. What type of molecule is it?
ATP|Transfers usable energy to many cellular processes|Which nucleotide is a major cellular energy-transfer molecule?|A cellular pump requires an immediate chemical energy source. Which molecule commonly supplies it?
Hydrolysis|Splits a molecule through a reaction involving water|Which process uses water to split a larger molecule?|A polymer's bond is broken with water contributing to the products. Which process occurred?
`);
add(3,'The Cellular Level of Organization','Membrane checkpoint',`
Cell membrane|A selectively permeable boundary around a cell|What forms the selectively permeable cell boundary?|A cell controls which substances enter its cytoplasm. Which boundary provides this control?
Ribosome|Builds polypeptides using information carried by messenger RNA|Which structure assembles polypeptides?|A cell is translating a messenger RNA sequence. Which structure performs this task?
Mitochondrion|Produces much of a cell's ATP through aerobic respiration|Which organelle is a major site of aerobic ATP production?|A cell needs more ATP from oxygen-dependent respiration. Which organelle is central to this process?
Golgi apparatus|Modifies and sorts cargo from the endoplasmic reticulum|Which organelle modifies and sorts many proteins for delivery?|A secreted protein must be modified and packaged after leaving the rough ER. Which organelle is next?
Osmosis|Net movement of water across a selectively permeable membrane|What describes water moving across a selectively permeable membrane?|Water crosses a membrane toward a higher concentration of nonpenetrating solute. Which process is occurring?
Simple diffusion|Net movement down a concentration gradient without a carrier or ATP|Which transport process moves small permeable molecules without a carrier?|Oxygen crosses a lipid bilayer down its concentration gradient. Which process best describes this?
Primary active transport|Uses ATP directly to move substances against a gradient|Which transport mechanism uses ATP directly at a membrane pump?|A membrane pump hydrolyzes ATP while moving ions against their gradient. Which transport mechanism is used?
Transcription|Produces an RNA copy from a DNA template|Which process copies DNA information into RNA?|Before a protein can be translated, its gene is copied into messenger RNA. Which process makes that copy?
`);
add(4,'The Tissue Level of Organization','Tissue scanner',`
Epithelial tissue|Covers surfaces and lines cavities with closely packed cells|Which tissue commonly lines cavities and covers surfaces?|A sample has tightly packed cells forming a surface barrier. Which broad tissue class best fits?
Connective tissue|Supports and connects structures using an extracellular matrix|Which tissue class usually has a substantial extracellular matrix?|A sample contains cells dispersed through a supporting matrix. Which tissue class best fits?
Muscle tissue|Produces force through cellular contraction|Which tissue class specializes in contraction?|A tissue generates force by shortening its contractile cells. Which class is it?
Nervous tissue|Transmits and processes signals using neurons and supporting cells|Which tissue class specializes in neural communication?|A sample contains neurons with long processes and supporting glia. Which tissue class best fits?
Simple squamous epithelium|A single layer of thin cells suited to rapid exchange|Which epithelium is thin and well suited to diffusion?|A gas-exchange surface needs a short diffusion distance. Which epithelial type is especially suitable?
Stratified squamous epithelium|Multiple cell layers that resist abrasion|Which epithelium provides protection against abrasion?|A surface repeatedly experiences friction and needs many protective layers. Which epithelial type fits?
Tendon|Dense connective tissue connecting muscle to bone|Which structure usually connects skeletal muscle to bone?|A contracting muscle transmits force to a bone through a cord of dense connective tissue. What is the cord?
Ligament|Dense connective tissue connecting bone to bone at a joint|Which structure connects bones and helps stabilize a joint?|A fibrous band limits excessive movement between adjacent bones. Which structure is it?
`);
add(5,'The Integumentary System','Barrier patrol',`
Epidermis|The outer epithelial layer of skin|Which skin layer forms the outer epithelial barrier?|A shallow scrape affects the skin's outer epithelial layer. Which layer is involved?
Dermis|Connective tissue layer containing vessels and many skin structures|Which skin layer contains blood vessels and many sensory structures?|A diagram labels the vascular connective tissue below the epidermis. Which layer is labeled?
Keratinocyte|A major epidermal cell that produces keratin|Which common epidermal cell produces keratin?|A skin cell contributes keratin to a protective surface. Which cell type is it?
Melanocyte|Produces melanin that helps protect against ultraviolet radiation|Which epidermal cell produces melanin?|A cell transfers pigment to nearby epidermal cells. Which cell type supplies the pigment?
Sweat gland|Produces sweat that can support evaporative cooling|Which skin structure supports cooling through sweat production?|Evaporation from the skin increases heat loss. Which structure supplied the liquid?
Sebaceous gland|Secretes lipid-rich sebum into hair follicles or onto skin|Which gland produces sebum?|A gland releases an oily secretion associated with a hair follicle. Which gland is it?
Arrector pili|Small smooth muscle that can raise a hair|Which muscle causes a hair to stand more upright?|Cold exposure produces goosebumps as hairs rise. Which structure contracted?
Hypodermis|Subcutaneous tissue that often contains fat for cushioning and insulation|Which tissue region lies beneath the dermis and often stores fat?|A diagram shows adipose-rich tissue below the skin proper. Which region is shown?
`);
add(6,'Bone and Skeletal Tissue','Remodeling crew',`
Osteoblast|A bone-forming cell that secretes bone matrix|Which cell builds new bone matrix?|A remodeling site needs new matrix deposited after resorption. Which cell performs this job?
Osteoclast|A cell that resorbs bone tissue|Which cell breaks down bone tissue during remodeling?|Bone matrix is being removed at a remodeling site. Which cell is responsible?
Osteocyte|A mature bone cell that maintains matrix and senses loading|Which mature bone cell occupies a lacuna?|A cell embedded in mineralized matrix helps monitor mechanical loading. Which cell is it?
Osteon|A cylindrical structural unit of compact bone|What is a cylindrical unit of compact bone with concentric lamellae?|A section shows concentric matrix rings around a central canal. Which structural unit is visible?
Trabecula|A strut or plate forming the framework of spongy bone|What forms the lattice-like framework of spongy bone?|A sample shows thin bony supports with marrow spaces between them. What are these supports called?
Epiphyseal plate|A cartilage region supporting lengthwise growth of an immature long bone|Which cartilage region permits a growing long bone to lengthen?|A child's long bone is growing in length at a cartilage zone near its end. Which zone is active?
Periosteum|A membrane covering the outer bone surface except at articular cartilage|What covers most of the external surface of a bone?|A fibrous membrane is lifted from the outside of a bone shaft. Which membrane is it?
Red bone marrow|A major site of blood-cell formation|Which marrow tissue produces blood cells?|A tissue inside bone is generating new blood cells. Which marrow type is active?
`);
add(7,'The Axial Skeleton','Central scaffold',`
Frontal bone|Forms the forehead and part of the roof of the orbits|Which bone forms the forehead?|A diagram highlights the forehead above the eye sockets. Which bone is highlighted?
Occipital bone|Forms the posterior skull and surrounds the foramen magnum|Which bone surrounds the foramen magnum?|A label points to the skull opening through which the spinal cord passes. Which bone surrounds it?
Mandible|Forms the lower jaw|Which bone forms the lower jaw?|A diagram highlights the movable lower jaw. Which bone is shown?
Hyoid bone|Supports the tongue and does not directly articulate with another bone|Which neck bone does not directly articulate with another bone?|A small neck bone anchors tongue-related muscles without a direct bony joint. Which bone is it?
Atlas|The first cervical vertebra supporting the skull|Which vertebra is C1?|A diagram labels the vertebra directly beneath the skull. Which named vertebra is it?
Axis|The second cervical vertebra with a dens that permits head rotation|Which vertebra has the dens?|A model rotates the atlas and head around a tooth-like projection. Which vertebra bears that projection?
Sternum|The midline breastbone of the anterior thorax|Which bone lies at the front midline of the thoracic cage?|A label points to the central bone where many rib cartilages attach anteriorly. Which bone is it?
Sacrum|A fused vertebral structure contributing to the posterior pelvis|Which fused structure connects the spine with the pelvic girdle?|A triangular fused bone lies between the hip bones at the base of the spine. Which bone is shown?
`);
add(8,'The Appendicular Skeleton','Limb landmarks',`
Clavicle|A shoulder-girdle bone linking the sternum and scapula|Which bone is commonly called the collarbone?|A label points to the slender bone between the sternum and shoulder. Which bone is it?
Scapula|The shoulder blade bearing the glenoid cavity|Which bone bears the glenoid cavity?|The socket for the head of the humerus is highlighted. Which bone contains the socket?
Humerus|The long bone of the arm between shoulder and elbow|Which bone occupies the arm between shoulder and elbow?|A diagram labels the single long bone of the upper arm. Which bone is shown?
Radius|The forearm bone on the thumb side in anatomical position|Which forearm bone lies on the thumb side in anatomical position?|A label follows the forearm bone toward the thumb. Which bone is it?
Ulna|The forearm bone with the olecranon at the elbow|Which forearm bone forms the prominent olecranon?|A diagram highlights the bony tip at the back of the elbow. Which forearm bone forms it?
Femur|The long bone of the thigh|Which bone is the thigh bone?|A model highlights the bone between hip and knee. Which bone is highlighted?
Tibia|The large medial weight-bearing bone of the leg|Which leg bone is the major medial weight-bearing bone?|A label points to the large bone on the medial side between knee and ankle. Which bone is it?
Fibula|The slender lateral bone of the leg|Which slender leg bone lies lateral to the tibia?|A model highlights the thin bone on the lateral side of the lower leg. Which bone is shown?
`);
add(9,'Joints','Movement laboratory',`
Synarthrosis|A functional joint classification for essentially immovable joints|Which functional class describes an essentially immovable joint?|A skull suture permits essentially no movement. Which functional class fits?
Amphiarthrosis|A functional joint classification for slightly movable joints|Which functional class describes a slightly movable joint?|A joint allows limited movement rather than free motion. Which functional class fits?
Diarthrosis|A functional joint classification for freely movable joints|Which functional class describes freely movable joints?|A synovial joint allows a wide range of movement. Which functional class applies?
Synovial fluid|Lubricates and nourishes surfaces within a synovial joint|Which fluid lubricates a synovial joint?|Articular surfaces move with reduced friction inside a joint cavity. Which fluid helps this happen?
Hinge joint|Permits mainly flexion and extension around one axis|Which synovial joint type mainly permits flexion and extension?|A simplified elbow model bends and straightens around one axis. Which joint type is illustrated?
Ball-and-socket joint|Permits movement around multiple axes|Which joint type permits movement around multiple axes?|A shoulder model moves in many directions and rotates. Which joint type permits this?
Abduction|Movement away from the body's midline|Which movement takes a limb away from the midline?|An arm moves laterally away from the trunk. Which movement is occurring?
Flexion|Usually decreases the angle between articulating bones|Which movement usually decreases a joint angle?|The elbow bends so the forearm approaches the arm. Which movement is occurring?
`);
add(10,'Muscle Tissue','Contraction circuit',`
Sarcomere|The repeating contractile unit between two Z discs|What is the repeating contractile unit of a skeletal myofibril?|A diagram brackets the region from one Z disc to the next. Which unit is bracketed?
Actin|The principal protein of a thin filament|Which protein is the principal component of thin filaments?|A label points to a filament containing myosin-binding sites. Which main protein forms it?
Myosin|The motor protein forming thick filaments|Which protein forms thick filaments and cross-bridges?|A filament head binds actin and performs a power stroke. Which protein provides the head?
Troponin|A regulatory protein complex that binds calcium during activation|Which regulatory complex binds calcium in skeletal muscle?|Calcium rises and binds a regulator that shifts tropomyosin. Which regulator binds the calcium?
Sarcoplasmic reticulum|Stores and releases calcium within a muscle fiber|Which muscle-fiber structure stores calcium?|A stimulated muscle fiber releases calcium from an internal membrane system. Which system releases it?
Motor unit|One motor neuron and all the muscle fibers it innervates|What is one motor neuron plus the fibers it controls?|Activating one motor neuron recruits all of its associated muscle fibers. What is this group called?
Acetylcholine|The neurotransmitter released at a skeletal neuromuscular junction|Which neurotransmitter is released at the skeletal neuromuscular junction?|A motor neuron's signal must cross the neuromuscular junction. Which transmitter is released?
ATP|Binds myosin to allow detachment from actin and supplies energy for cycling|Which molecule permits myosin to detach from actin?|A cross-bridge must detach before another contraction cycle. Which molecule must bind myosin?
`);
add(11,'The Muscular System','Motion crew',`
Agonist|The prime mover chiefly responsible for a specified action|What is the prime mover for an action called?|One muscle provides most of the force for a specified movement. Which functional role does it play?
Antagonist|A muscle that opposes a specified action|What is a muscle opposing a prime mover called?|A muscle produces the opposite action to the movement being studied. Which functional role does it play?
Synergist|A muscle that assists an agonist or reduces unwanted movement|What is a muscle assisting a prime mover called?|An assisting muscle contributes force and limits unwanted motion. Which functional role fits?
Fixator|A stabilizing synergist that holds a bone or body region steady|What is a synergist that stabilizes a bone or body region called?|A muscle stabilizes the shoulder so another can move the arm effectively. Which special synergist role fits?
Diaphragm|The principal skeletal muscle of quiet inspiration|Which muscle is the principal driver of quiet inspiration?|The thoracic cavity expands during a quiet inhalation. Which principal muscle contracts?
Biceps brachii|An anterior arm muscle that flexes the elbow and supinates the forearm|Which anterior arm muscle helps flex the elbow and supinate the forearm?|A learner turns the palm upward while flexing the elbow. Which listed muscle can contribute to both actions?
Triceps brachii|A posterior arm muscle that extends the elbow|Which posterior arm muscle extends the elbow?|A learner straightens the elbow against resistance. Which listed muscle is a prime mover?
Quadriceps femoris|A thigh muscle group that extends the knee|Which anterior thigh group extends the knee?|A learner straightens the knee to rise from a chair. Which listed muscle group supplies knee extension?
`);
add(12,'Introduction to the Nervous System','Signal relay',`
Neuron|An excitable cell that communicates through electrical and chemical signals|Which cell specializes in transmitting neural signals?|A cell generates an action potential and communicates at a synapse. Which cell type fits?
Dendrite|A neuronal process that commonly receives incoming signals|Which neuronal process commonly receives incoming signals?|A diagram highlights branching neuronal processes receiving synaptic input. Which processes are shown?
Axon|A neuronal process that conducts signals toward terminal endings|Which neuronal process conducts signals toward its terminals?|A signal travels from a cell body toward distant synaptic terminals. Which process conducts it?
Myelin|An insulating sheath that supports rapid conduction along an axon|What insulating sheath promotes rapid axonal conduction?|A wrapped insulating layer permits faster signal propagation between nodes. Which sheath is shown?
Depolarization|A membrane potential shift toward a less negative value|What describes a shift toward a less negative membrane potential?|A membrane changes from minus 70 to minus 50 millivolts. Which change occurred?
Repolarization|A return toward resting membrane potential after depolarization|What describes a return toward resting potential after depolarization?|Following a spike, a membrane becomes more negative again toward rest. Which phase is occurring?
Synapse|A junction at which a neuron communicates with another cell|What is the communication junction between a neuron and its target?|A neuronal terminal releases transmitter onto another cell at a specialized junction. What is the junction?
Neuroglia|Cells that support and regulate the environment of neurons|Which broad cell group supports neurons?|A neural tissue sample includes support cells that maintain the neuronal environment. Which group do they belong to?
`);
add(13,'The Anatomy of the Nervous System','Neural atlas',`
Cerebrum|Brain region supporting conscious perception and many higher functions|Which major brain region supports many conscious higher functions?|A task involves conscious interpretation and voluntary planning. Which major brain region is especially involved?
Cerebellum|Helps coordinate movement and motor learning|Which brain region helps coordinate movement?|A learner practices a movement until its timing becomes smoother. Which region is central to this coordination?
Brain stem|Includes midbrain, pons, and medulla and connects toward the spinal cord|Which region includes the midbrain, pons, and medulla?|A diagram groups the midbrain, pons, and medulla. Which regional name fits the group?
Thalamus|Relays most sensory information toward the cerebral cortex|Which diencephalic structure relays most sensory input to cortex?|A sensory pathway other than olfaction relays toward the cerebral cortex. Which structure commonly participates?
Hypothalamus|Helps regulate homeostasis and links neural with endocrine control|Which brain structure helps integrate homeostatic and endocrine regulation?|A scenario combines temperature regulation with hormonal control. Which structure integrates these functions?
Spinal cord|Carries pathways between brain and body and integrates spinal reflexes|Which CNS structure carries spinal pathways and integrates many reflexes?|A withdrawal response can be integrated without waiting for conscious perception. Which CNS structure can integrate it?
Dorsal root|Carries sensory axons into the spinal cord|Which spinal root carries sensory input toward the cord?|An incoming sensory axon enters the spinal cord through which root?
Ventral root|Carries motor axons out of the spinal cord|Which spinal root carries motor output away from the cord?|A motor axon leaves the spinal cord toward a skeletal muscle through which root?
`);
add(14,'The Somatic Nervous System','Sense and respond',`
Photoreceptor|A sensory receptor responding to light|Which receptor responds to light?|A retinal receptor transduces photons into a cellular signal. Which receptor class is it?
Mechanoreceptor|A sensory receptor responding to physical deformation|Which receptor responds to mechanical deformation?|Pressure deforms a sensory ending and changes its signal. Which receptor class fits?
Chemoreceptor|A sensory receptor responding to chemical stimuli|Which receptor responds to chemical stimuli?|Dissolved molecules activate a taste receptor. Which receptor class is involved?
Proprioceptor|Provides information about body position and movement|Which receptor reports body position and movement?|With eyes closed, a learner can sense a joint's position. Which type of receptor supplies this information?
Rod|A retinal photoreceptor especially sensitive in dim light|Which retinal photoreceptor is especially useful in dim light?|A learner detects shapes in very low illumination with little color detail. Which retinal receptor is most useful?
Cone|A retinal photoreceptor supporting color vision and high acuity|Which retinal receptor supports color vision?|In bright light, a learner distinguishes colors and fine detail. Which receptor supports this task?
Muscle spindle|Detects changes in muscle length|Which sensory structure monitors muscle stretch?|A muscle is lengthened and sensory input initiates a stretch reflex. Which receptor detected the stretch?
Somatic motor neuron|Provides motor output to skeletal muscle|Which motor-neuron category innervates skeletal muscle?|A voluntary command reaches a skeletal muscle fiber. Which category of motor neuron delivers it?
`);
add(15,'The Autonomic Nervous System','Response switchboard',`
Sympathetic division|An autonomic division associated with mobilizing resources during challenge|Which autonomic division commonly mobilizes resources during challenge?|A fictional scenario shows increased cardiac activity during an acute challenge. Which division commonly supports this response?
Parasympathetic division|An autonomic division commonly supporting digestion and maintenance|Which division commonly supports digestion and maintenance?|A resting scenario favors increased digestive activity. Which division commonly promotes this response?
Preganglionic neuron|Carries an autonomic signal from the CNS toward a ganglion|Which autonomic neuron runs from CNS to a ganglion?|The first neuron of a typical two-neuron autonomic pathway leaves the CNS. Which neuron is it?
Postganglionic neuron|Carries an autonomic signal from a ganglion toward a target|Which autonomic neuron runs from a ganglion to a target?|A neuron conducts from an autonomic ganglion to a smooth muscle target. Which neuron is it?
Acetylcholine|The transmitter released by all autonomic preganglionic neurons|Which transmitter do autonomic preganglionic neurons release?|A typical preganglionic neuron in either autonomic division releases which transmitter?
Norepinephrine|The transmitter released by most sympathetic postganglionic neurons|Which transmitter is released by most sympathetic postganglionic neurons?|A typical sympathetic postganglionic terminal, excluding sweat-gland exceptions, releases which transmitter?
Adrenal medulla|Releases catecholamines into blood during sympathetic activation|Which adrenal region releases catecholamines?|Sympathetic stimulation prompts an adrenal region to release epinephrine into circulation. Which region is it?
Autonomic ganglion|A collection of peripheral cell bodies in an autonomic pathway|Where does a typical preganglionic neuron synapse with a postganglionic neuron?|A peripheral cluster contains the cell bodies of autonomic postganglionic neurons. What is this cluster?
`);
add(16,'The Neurological Exam','Function detective',`
Mental status examination|Assesses functions such as orientation, memory, and language|Which examination component assesses orientation and memory?|In a fictional examination, a person answers orientation and recall questions. Which component is being assessed?
Optic nerve|Cranial nerve II carrying visual information from the retina|Which cranial nerve carries retinal visual information?|A fictional examination checks visual input from the retina. Which cranial nerve carries this input?
Oculomotor nerve|Cranial nerve III controlling several eye muscles and pupil constriction|Which cranial nerve supplies pupil-constricting output?|A simplified pupil-light reflex requires constriction of the pupil. Which listed nerve carries the relevant motor output?
Trigeminal nerve|Cranial nerve V carrying much facial sensation and controlling mastication|Which cranial nerve carries much facial sensation?|A fictional examination tests touch sensation across major facial regions. Which listed nerve is most relevant?
Facial nerve|Cranial nerve VII controlling facial-expression muscles|Which cranial nerve controls facial-expression muscles?|A fictional examination asks a person to smile and close the eyes firmly. Which nerve supplies these muscles?
Hypoglossal nerve|Cranial nerve XII controlling most tongue movements|Which cranial nerve controls most tongue movements?|A fictional examination asks a person to move the tongue. Which listed nerve supplies most tongue muscles?
Coordination examination|Assesses smooth timing and accuracy of movements|Which examination component includes a finger-to-nose coordination task?|A fictional task checks the accuracy and timing of a finger-to-nose movement. Which examination component is being sampled?
Reflex examination|Assesses responses mediated by reflex pathways|Which examination component checks a tendon-triggered reflex?|A tendon tap evokes a brief muscle response in a fictional examination. Which component is being assessed?
`);
add(17,'The Endocrine System','Hormone courier',`
Insulin|A pancreatic hormone promoting glucose uptake and storage|Which pancreatic hormone generally lowers blood glucose?|After a meal, a signal promotes glucose uptake and storage. Which listed hormone is responsible?
Glucagon|A pancreatic hormone that promotes increased blood glucose|Which pancreatic hormone generally increases blood glucose?|During a fasting scenario, a pancreatic signal promotes release of glucose into blood. Which hormone fits?
Antidiuretic hormone|Promotes water conservation by increasing renal water reabsorption|Which hormone promotes renal water conservation?|A signal increases water permeability in renal collecting ducts. Which hormone commonly produces this response?
Aldosterone|An adrenal cortical hormone promoting sodium reabsorption and potassium secretion|Which adrenal cortical hormone promotes sodium retention?|A hormonal signal increases distal sodium reabsorption and potassium secretion. Which hormone is involved?
Parathyroid hormone|A hormone that helps raise blood calcium concentration|Which hormone helps raise blood calcium?|A low-calcium signal stimulates a hormone that acts to increase blood calcium. Which hormone fits?
Thyroid hormones|Hormones that increase metabolic activity in many tissues|Which listed hormones promote metabolic activity in many tissues?|A hormonal signal increases metabolic activity across many target tissues. Which listed hormones fit?
Anterior pituitary|A glandular pituitary region that synthesizes several tropic hormones|Which pituitary region synthesizes hormones such as TSH and ACTH?|A pituitary region produces signals regulating the thyroid and adrenal cortex. Which region is it?
Posterior pituitary|A neural pituitary region that releases hypothalamic ADH and oxytocin|Which pituitary region releases ADH and oxytocin made in the hypothalamus?|A hormone made in the hypothalamus travels down an axon before release. Which pituitary region releases it?
`);
add(18,'Blood','Cell convoy',`
Erythrocyte|A red blood cell specialized for respiratory-gas transport|Which blood cell is specialized for respiratory-gas transport?|A formed element carries much of the blood's oxygen using hemoglobin. Which cell is it?
Hemoglobin|An erythrocyte protein that reversibly binds oxygen|Which erythrocyte protein binds oxygen?|An oxygen molecule binds a heme-associated iron ion in a red cell. Which protein contains this site?
Leukocyte|A white blood cell participating in body defense|Which broad blood-cell category participates in defense?|A circulating immune cell enters tissue in response to a threat. Which broad category does it belong to?
Platelet|A cell fragment contributing to hemostasis|Which cell fragment contributes to stopping bleeding?|Small circulating fragments adhere at a damaged vessel and help form a plug. Which fragments are involved?
Plasma|The liquid extracellular matrix of blood|What is the liquid matrix of blood called?|Formed elements are suspended in a watery matrix containing proteins and solutes. What is the matrix?
Albumin|A major plasma protein contributing to colloid osmotic pressure|Which major plasma protein helps maintain colloid osmotic pressure?|A plasma protein helps retain water within the circulation through osmotic effects. Which major protein fits?
Fibrin|The insoluble protein strands forming a clot mesh|Which protein forms the mesh of a blood clot?|Soluble fibrinogen is converted into an insoluble network that stabilizes a clot. What forms this network?
Erythropoietin|A hormone promoting red-cell production in bone marrow|Which hormone stimulates red-cell production?|A low-oxygen signal increases a hormone that promotes erythrocyte production. Which hormone is involved?
`);
add(19,'The Cardiovascular System: The Heart','Pulmonary delivery',`
Right atrium|Receives systemic venous blood returning to the heart|Which chamber receives blood from the venae cavae?|A blood-flow marker returns from the body through a vena cava. Which chamber does it enter?
Right ventricle|Pumps blood toward the lungs through the pulmonary trunk|Which chamber pumps blood into the pulmonary trunk?|A blood-flow marker is about to enter pulmonary circulation. Which chamber ejects it?
Left atrium|Receives blood returning from the lungs through pulmonary veins|Which chamber receives blood from pulmonary veins?|A blood-flow marker returns from the lungs. Which chamber does it enter?
Left ventricle|Pumps blood into the aorta for systemic circulation|Which chamber pumps blood into the aorta?|A blood-flow marker is about to supply systemic circulation. Which chamber ejects it?
Tricuspid valve|The right atrioventricular valve between right atrium and right ventricle|Which valve lies between the right atrium and right ventricle?|A marker passes from right atrium into right ventricle. Which valve does it cross?
Mitral valve|The left atrioventricular valve between left atrium and left ventricle|Which valve lies between the left atrium and left ventricle?|A marker passes from left atrium into left ventricle. Which valve does it cross?
Sinoatrial node|The usual pacemaker initiating a heartbeat's electrical activity|What is the usual pacemaker of the heart?|A normal heartbeat begins with spontaneous electrical activity at which listed structure?
Systole|The contraction phase of a cardiac chamber|What is a cardiac chamber's contraction phase called?|A ventricle contracts and ejects blood after pressure rises sufficiently. Which phase is it in?
`);
add(20,'The Cardiovascular System: Blood Vessels and Circulation','Vascular routes',`
Artery|A vessel carrying blood away from the heart|Which vessel category carries blood away from the heart?|A vessel leaves a ventricle but carries relatively oxygen-poor blood. Which vessel category still applies?
Vein|A vessel carrying blood toward the heart|Which vessel category carries blood toward the heart?|A vessel returns from the lungs with relatively oxygen-rich blood. Which vessel category still applies?
Capillary|A small vessel with a thin wall specialized for exchange|Which vessel is especially suited to exchange with tissues?|A blood-flow marker reaches a thin-walled exchange surface beside tissue cells. Which vessel type is present?
Arteriole|A small artery that strongly contributes to peripheral resistance|Which small vessel type is a major regulator of local resistance?|A local vascular segment changes smooth-muscle tone to regulate tissue perfusion. Which small vessel type is central?
Vasoconstriction|Narrowing of a vessel's lumen through smooth-muscle contraction|What is narrowing of a vessel's lumen called?|A vessel's smooth muscle contracts and its lumen becomes narrower. Which change occurred?
Vasodilation|Widening of a vessel's lumen through smooth-muscle relaxation|What is widening of a vessel's lumen called?|A resistance vessel relaxes and its lumen becomes wider. Which change occurred?
Venous valve|A structure helping prevent backward blood flow in many veins|What helps prevent backward flow in many limb veins?|A limb vein needs one-way flow as surrounding skeletal muscles squeeze it. Which structure helps prevent reflux?
Baroreceptor|A stretch-sensitive receptor contributing to blood-pressure reflexes|Which receptor detects vascular stretch for pressure regulation?|A pressure change alters stretching in a carotid sinus. Which receptor type detects this change?
`);
add(21,'The Lymphatic System and Immunity','Defense network',`
Lymph|Interstitial fluid after it enters lymphatic vessels|What is interstitial fluid called after entering lymphatic vessels?|Fluid leaves tissue spaces and enters a lymphatic capillary. What is it now called?
Lymph node|Filters lymph and supports immune-cell interactions|Which structure filters lymph along lymphatic vessels?|A lymph-flow marker passes through a small structure containing many immune cells. Which structure filters it?
Spleen|A lymphoid organ that monitors blood and removes aged erythrocytes|Which lymphoid organ filters blood rather than lymph?|An aged red blood cell is removed from circulation by a lymphoid organ. Which listed organ is involved?
Thymus|A lymphoid organ where T cells mature|In which lymphoid organ do T cells mature?|An immature T cell must undergo maturation and selection. Which listed organ is the destination?
Innate immunity|Defense mechanisms that do not require antigen-specific prior exposure|Which broad defense system acts without antigen-specific prior exposure?|A first-line defense responds rapidly using barriers and phagocytes. Which broad system is illustrated?
Adaptive immunity|Antigen-specific defense that can generate immunological memory|Which defense system can develop antigen-specific memory?|A later exposure evokes a faster antigen-specific response. Which broad immune system explains the memory?
B cell|A lymphocyte lineage that can differentiate into antibody-secreting cells|Which lymphocyte lineage produces antibody-secreting plasma cells?|An activated lymphocyte differentiates into a plasma cell. Which lineage did it come from?
Cytotoxic T cell|An adaptive lymphocyte that can kill infected target cells|Which adaptive lymphocyte can directly kill infected target cells?|A lymphocyte recognizes an infected target through antigen presentation and kills it. Which listed cell fits?
`);
add(22,'The Respiratory System','Alveolar exchange',`
Alveolus|A small air space with a thin surface for respiratory gas exchange|What is a small pulmonary air space specialized for gas exchange?|An oxygen marker reaches a thin-walled air space beside pulmonary capillaries. Which structure is this?
Diaphragm|The principal muscle expanding the thorax during quiet inspiration|Which muscle is the principal driver of quiet inspiration?|Thoracic volume increases during a quiet breath in. Which principal muscle contracts?
Surfactant|A secretion that reduces alveolar surface tension|What reduces surface tension at the alveolar air-liquid interface?|A secretion makes alveoli less prone to collapse by reducing surface tension. What is the secretion?
Partial-pressure gradient|The difference driving net diffusion of an individual gas|What drives net diffusion of oxygen across a respiratory membrane?|Oxygen moves from alveolar air toward blood while its pressures differ. Which difference drives the movement?
External respiration|Gas exchange between alveolar air and pulmonary blood|What is gas exchange between alveoli and pulmonary blood called?|A gas marker crosses the alveolar-capillary membrane. Which respiration category is illustrated?
Internal respiration|Gas exchange between systemic blood and tissue cells|What is gas exchange between systemic blood and tissue cells called?|Oxygen leaves a systemic capillary for nearby tissue cells. Which respiration category is illustrated?
Inspiration|Airflow into the lungs as alveolar pressure falls below atmospheric pressure|What is airflow into the lungs called?|Alveolar pressure falls below atmospheric pressure and air flows inward. Which phase is occurring?
Expiration|Airflow out of the lungs as alveolar pressure exceeds atmospheric pressure|What is airflow out of the lungs called?|Alveolar pressure rises above atmospheric pressure and air flows outward. Which phase is occurring?
`);
add(23,'The Digestive System','Meal transit',`
Peristalsis|Coordinated waves of contraction that propel contents along a tract|What propels digestive contents through coordinated contraction waves?|A food marker advances along the esophagus as coordinated muscle waves pass. Which process propels it?
Stomach|An organ that mixes food and begins substantial protein digestion|Which organ mixes food with acid and pepsin?|A food marker encounters acid and pepsin during mixing. Which organ is it in?
Small intestine|The main site of most nutrient digestion and absorption|Where does most nutrient absorption occur?|Digested nutrients cross a large villous surface into blood or lymph. Which organ is the main site?
Large intestine|An organ that absorbs remaining water and helps form feces|Which organ helps absorb remaining water and form feces?|A food residue loses additional water and becomes more solid after leaving the small intestine. Which organ is involved?
Liver|Produces bile and processes many absorbed nutrients|Which organ produces bile?|A digestive secretion that helps handle dietary lipids is produced by which listed organ?
Gallbladder|Stores and concentrates bile|Which organ stores and concentrates bile?|Between meals, bile is stored and concentrated in which organ?
Pancreas|Supplies digestive enzymes and bicarbonate to the small intestine|Which organ supplies digestive enzymes and bicarbonate to the duodenum?|Acidic chyme reaches the duodenum and receives bicarbonate-rich enzyme secretion. Which organ supplied it?
Villus|A fingerlike intestinal projection increasing absorptive surface area|What fingerlike intestinal projection increases absorptive surface area?|A diagram highlights a mucosal projection containing capillaries and a lacteal. Which structure is highlighted?
`);
add(24,'Nutrition and Metabolism','Energy workshop',`
Glycolysis|A cytosolic pathway that breaks glucose into pyruvate|Which pathway converts glucose to pyruvate in the cytosol?|A cell begins glucose breakdown in its cytosol before mitochondrial oxidation. Which pathway is underway?
Citric acid cycle|A mitochondrial pathway oxidizing acetyl groups and producing reduced carriers|Which mitochondrial cycle processes acetyl groups?|Acetyl-CoA enters a mitochondrial cycle that generates reduced electron carriers. Which pathway is involved?
Electron transport chain|Transfers electrons through membrane complexes linked to a proton gradient|Which mitochondrial system transfers electrons to help build a proton gradient?|Electrons pass through inner-membrane complexes and help establish a proton gradient. Which system is active?
ATP synthase|An enzyme using a proton gradient to synthesize ATP|Which enzyme uses a proton gradient to produce ATP?|Protons flow down their gradient through a complex that produces ATP. Which enzyme complex is this?
Glycogenesis|The formation of glycogen from glucose|What is building glycogen from glucose called?|After a meal, excess glucose is stored as glycogen. Which process stores it?
Glycogenolysis|The breakdown of glycogen|What is glycogen breakdown called?|A stored glycogen reserve is broken down to provide glucose units. Which process is occurring?
Gluconeogenesis|The formation of glucose from noncarbohydrate precursors|What is making glucose from noncarbohydrate precursors called?|A fasting scenario uses amino-acid-derived substrates to produce glucose. Which process is involved?
Beta oxidation|A pathway breaking fatty acids into acetyl-CoA units|Which pathway breaks fatty acids into acetyl-CoA units?|A fatty acid is shortened repeatedly to supply acetyl-CoA. Which pathway carries this out?
`);
add(25,'The Urinary System','Nephron return route',`
Nephron|The kidney's functional unit for filtrate formation and processing|What is the functional unit of a kidney?|A model follows one renal corpuscle and its associated tubule. Which functional unit is being followed?
Glomerulus|A capillary tuft where fluid is filtered into the surrounding capsule|Which capillary tuft is the filtration site in a renal corpuscle?|A blood-flow marker reaches capillaries inside a renal corpuscle. Which capillary structure is shown?
Filtration|Movement of fluid and small solutes from glomerular blood into capsular space|What is movement from glomerular blood into capsular space called?|Small solutes and water enter capsular space from glomerular capillaries. Which process occurred?
Reabsorption|Movement from tubular fluid back toward the blood|What is movement from tubular fluid back toward blood called?|A glucose marker leaves tubular fluid and returns toward the circulation. Which process is illustrated?
Secretion|Movement from blood or interstitial fluid into the renal tubule|What is movement from blood into tubular fluid called?|A substance is transported from peritubular blood into the tubule. Which process is illustrated?
Proximal convoluted tubule|A nephron segment that performs extensive bulk reabsorption|Which nephron segment performs extensive bulk reabsorption?|A filtrate marker first enters a convoluted tubule where much filtered water and solute are recovered. Which segment is it?
Ureter|A tube conveying urine from a kidney to the bladder|Which tube carries urine from kidney to bladder?|A urine marker leaves a kidney and travels toward the bladder. Which tube carries it?
Urethra|A passage conveying urine from the bladder to the exterior|Which passage carries urine from bladder to exterior?|A urine marker leaves the bladder on its route out of the body. Which passage does it enter?
`);
add(26,'Fluid, Electrolyte, and Acid–Base Balance','Balance chamber',`
Intracellular fluid|Fluid contained within cells|Which fluid compartment lies inside cells?|A water marker is located in the cytosol. Which broad fluid compartment contains it?
Extracellular fluid|Fluid outside cells including plasma and interstitial fluid|Which broad fluid compartment includes plasma and interstitial fluid?|A water marker is in plasma rather than inside a cell. Which broad compartment contains it?
Sodium|The major extracellular cation|Which ion is the major extracellular cation?|A diagram asks for the principal positive ion in extracellular fluid. Which ion should be selected?
Potassium|The major intracellular cation|Which ion is the major intracellular cation?|A diagram asks for the principal positive ion within cells. Which ion should be selected?
Antidiuretic hormone|Promotes increased water reabsorption in renal collecting ducts|Which hormone promotes renal water conservation?|A rise in plasma osmolarity triggers a hormonal response that conserves water. Which listed hormone fits?
Buffer|A chemical system that resists changes in pH|What chemical system helps resist rapid pH changes?|An added acid is partly absorbed by a chemical system, limiting the immediate pH shift. Which system is acting?
Respiratory acidosis|An acid–base disturbance associated with excessive carbon dioxide retention|Which acid–base disturbance can result from carbon dioxide retention?|In a simplified scenario, inadequate ventilation raises carbon dioxide and lowers pH. Which disturbance is illustrated?
Respiratory alkalosis|An acid–base disturbance associated with excessive carbon dioxide loss|Which acid–base disturbance can result from excessive carbon dioxide loss?|In a simplified scenario, excessive ventilation lowers carbon dioxide and raises pH. Which disturbance is illustrated?
`);
add(27,'The Reproductive System','Reproductive pathways',`
Testis|A gonad producing sperm and secreting androgens|Which gonad produces sperm?|A diagram highlights a gonad with seminiferous tubules. Which organ is shown?
Epididymis|A site where sperm mature and are stored|Where do sperm undergo further maturation and storage?|A sperm marker has left the testis and enters a coiled maturation passage. Which structure is it?
Ductus deferens|A muscular duct transporting sperm from the epididymis|Which duct transports sperm away from the epididymis?|A sperm marker leaves the epididymis during transport. Which named duct carries it onward?
Ovary|A gonad containing developing oocytes and producing reproductive hormones|Which gonad contains developing oocytes?|A diagram highlights follicles surrounding developing oocytes. Which organ contains them?
Uterine tube|A passage where fertilization commonly occurs|Where does fertilization commonly occur?|An ovulated oocyte encounters sperm at the usual site of fertilization. Which listed passage is this?
Endometrium|The inner uterine lining that changes during the uterine cycle|Which uterine lining changes during the uterine cycle?|A diagram highlights the uterine layer that thickens and may be shed during menstruation. Which layer is shown?
Luteinizing hormone|A pituitary hormone whose midcycle surge helps trigger ovulation|Which hormone's midcycle surge helps trigger ovulation?|A surge precedes release of an oocyte from a mature follicle. Which listed hormone rises?
Progesterone|A hormone that supports a secretory uterine lining after ovulation|Which hormone supports a secretory endometrium after ovulation?|After ovulation, a corpus luteum produces a hormone supporting the uterine lining. Which hormone is central?
`);
add(28,'Development and Genetic Inheritance','Inheritance studio',`
Zygote|The cell formed by fusion of sperm and oocyte|What is the cell produced by fertilization called?|Sperm and oocyte fuse to form a new diploid cell. What is this initial cell called?
Blastocyst|An early developmental stage with an inner cell mass and surrounding trophoblast|Which early stage has an inner cell mass and trophoblast?|An early conceptus has a fluid-filled cavity, inner cell mass, and outer trophoblast. Which stage is it?
Ectoderm|A germ layer giving rise to epidermis and much of the nervous system|Which germ layer forms epidermis and much of the nervous system?|A developmental map traces neural tissue and epidermis to one germ layer. Which layer is it?
Mesoderm|A germ layer giving rise to structures including muscle and connective tissues|Which germ layer forms much muscle and connective tissue?|A developmental map traces skeletal muscle and much connective tissue to one germ layer. Which layer is it?
Endoderm|A germ layer forming much of the epithelial lining of digestive and respiratory tracts|Which germ layer forms much digestive and respiratory epithelial lining?|A developmental map traces much intestinal epithelial lining to one germ layer. Which layer is it?
Genotype|The genetic makeup considered for a specified trait or set of traits|What describes genetic makeup rather than observed expression?|In a stated single-gene model, a learner records the allele pair Aa. Which term describes that allele combination?
Phenotype|The observable expression of traits influenced by genes and environment|What describes observable trait expression?|A learner records an observed characteristic rather than its allele combination. Which term describes this expression?
Heterozygous|Having two different alleles at a specified gene locus|What describes two different alleles at one gene locus?|In an explicitly defined single-gene model, an allele pair is Aa. Which term describes this pair?
`);
const pathways={
 1:{title:'Order the levels of organization from smallest to largest.',steps:['Chemical','Cellular','Tissue','Organ','Organ system','Organism'],explanation:'Cells form tissues; tissues form organs; organs cooperate in systems within an organism.'},
 3:{title:'Route a secreted protein through this simplified pathway.',steps:['Ribosome on rough ER','Transport vesicle','Golgi apparatus','Secretory vesicle','Cell membrane'],explanation:'Many secreted proteins enter rough ER, pass through Golgi processing, and reach the surface by vesicles.'},
 6:{title:'Order the main stages of fracture repair.',steps:['Hematoma','Fibrocartilaginous callus','Bony callus','Bone remodeling'],explanation:'Repair progresses from a clot and soft callus to bone formation and later remodeling.'},
 10:{title:'Order this simplified activation sequence in skeletal muscle.',steps:['Motor neuron releases acetylcholine','Muscle membrane depolarizes','Sarcoplasmic reticulum releases calcium','Calcium binds troponin','Actin sites become available'],explanation:'Electrical activation leads to calcium release; calcium regulates access to actin binding sites.'},
 12:{title:'Order the main phases of an action potential.',steps:['Resting membrane potential','Threshold reached','Depolarization','Repolarization','Return toward resting potential'],explanation:'A threshold stimulus triggers a spike followed by recovery. This sequence omits channel-level details.'},
 13:{title:'Route sensory input through a simplified spinal reflex pathway.',steps:['Receptor','Sensory neuron','Spinal integration','Motor neuron','Effector'],explanation:'A spinal reflex links sensory input to motor output through an integration center.'},
 15:{title:'Route a typical two-neuron autonomic signal.',steps:['CNS','Preganglionic neuron','Autonomic ganglion','Postganglionic neuron','Target tissue'],explanation:'A typical autonomic pathway uses two neurons with a synapse in a peripheral ganglion.'},
 18:{title:'Order these broad hemostasis stages.',steps:['Vascular spasm','Platelet plug formation','Coagulation'],explanation:'Vessel constriction, platelet activity, and coagulation overlap; this is their conventional broad teaching order.'},
 19:{title:'Route blood from the right atrium through pulmonary circulation.',steps:['Right atrium','Right ventricle','Pulmonary trunk and arteries','Lung capillaries','Pulmonary veins','Left atrium'],explanation:'The right heart sends blood to the lungs; pulmonary veins return it to the left atrium.'},
 20:{title:'Route blood through a simplified systemic vascular circuit.',steps:['Artery','Arteriole','Capillary','Venule','Vein'],explanation:'Blood moves through progressively smaller supplying vessels, exchange capillaries, and returning vessels.'},
 22:{title:'Route inspired air toward a gas-exchange surface.',steps:['Trachea','Bronchus','Bronchiole','Alveolar region'],explanation:'Conducting passages branch toward the respiratory region. This route omits several intermediate structures.'},
 23:{title:'Route a swallowed food marker through these organs.',steps:['Esophagus','Stomach','Small intestine','Large intestine'],explanation:'Food passes through these organs in this order; accessory organs supply secretions rather than carrying the meal itself.'},
 24:{title:'Order the main stages of aerobic glucose oxidation.',steps:['Glycolysis','Pyruvate oxidation','Citric acid cycle','Oxidative phosphorylation'],explanation:'Glucose is processed through these linked stages. Cellular metabolism is interconnected rather than a single isolated line.'},
 25:{title:'Route filtrate through these nephron segments.',steps:['Capsular space','Proximal convoluted tubule','Nephron loop','Distal convoluted tubule','Collecting duct'],explanation:'Filtrate is modified as it travels along the tubule and into collecting ducts.'},
 27:{title:'Route sperm along this simplified transport pathway.',steps:['Testis','Epididymis','Ductus deferens','Ejaculatory duct','Urethra'],explanation:'Sperm mature after leaving the testis and then travel through these ducts. This is a simplified route.'},
 28:{title:'Order these early developmental events.',steps:['Fertilization','Cleavage','Morula','Blastocyst','Implantation begins'],explanation:'Cleavage generates smaller cells before formation of a blastocyst and the beginning of implantation.'}
};
const units=['Organization','Support & movement','Regulation & control','Fluids & transport','Energy & balance','Development & inheritance'];
return {chapters,pathways,units,book,version:'2.0.0'};
});
