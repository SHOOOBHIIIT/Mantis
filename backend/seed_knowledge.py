"""
Script to seed sample knowledge base products into Mantis.
Inserts product records + pre-written knowledge chunks directly into Supabase.
No PDF upload / no API calls needed — stays well within free tier.
"""
import os, uuid
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

# ── Get or create a demo company ─────────────────────────────────────────────
company_res = supabase.table("companies").select("id").limit(1).execute()
if company_res.data:
    company_id = company_res.data[0]["id"]
    print(f"Using existing company: {company_id}")
else:
    print("No company found. Please create one via the UI first.")
    exit(1)

# ── Helper ────────────────────────────────────────────────────────────────────
def create_product_with_chunks(name, model_number, category, description, image_url, docs):
    """Insert a product and its knowledge chunks."""
    product_id = str(uuid.uuid4())
    supabase.table("products").insert({
        "id": product_id,
        "company_id": company_id,
        "name": name,
        "model_number": model_number,
        "category": category,
        "description": description,
        "image_url": image_url,
        "is_published": True,
        "moss_index_id": f"product-{product_id}",
    }).execute()
    print(f"  Created product: {name} ({product_id})")

    for doc_title, pages in docs.items():
        doc_id = str(uuid.uuid4())
        chunks = []
        for page_num, (section, content_lines) in enumerate(pages, 1):
            for i, content in enumerate(content_lines):
                chunks.append({
                    "document_id": doc_id,
                    "product_id": product_id,
                    "chunk_index": (page_num - 1) * 10 + i,
                    "content": content,
                    "page_number": page_num,
                    "section_tag": section,
                    "char_count": len(content),
                })

        supabase.table("knowledge_documents").insert({
            "id": doc_id,
            "product_id": product_id,
            "title": doc_title,
            "type": "pdf",
            "page_count": len(pages),
            "chunk_count": len(chunks),
            "indexed": True,
        }).execute()

        for i in range(0, len(chunks), 100):
            supabase.table("document_chunks").insert(chunks[i:i+100]).execute()

        print(f"    Inserted doc '{doc_title}' with {len(chunks)} chunks")

    return product_id


# ═══════════════════════════════════════════════════════════════════════════════
# PRODUCT 1 — Samsung Galaxy S24 Ultra
# ═══════════════════════════════════════════════════════════════════════════════
create_product_with_chunks(
    name="Samsung Galaxy S24 Ultra",
    model_number="SM-S928B",
    category="electronics",
    description="Samsung's flagship smartphone with S Pen, 200MP camera, and Snapdragon 8 Gen 3. AI-powered features for photography, productivity, and communication.",
    image_url="https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s24-ultra-sm-s928bzaceub-thumb-539573629",
    docs={
        "Samsung Galaxy S24 Ultra User Guide": [
            ("general", [
                "Samsung Galaxy S24 Ultra (Model SM-S928B) supports 5G connectivity, Wi-Fi 7, Bluetooth 5.3, and NFC. The device runs Android 14 with One UI 6.1.",
                "Battery capacity: 5000 mAh. Supports 45W wired fast charging, 15W wireless charging, and 4.5W reverse wireless charging. Do not use non-Samsung chargers above 45W.",
                "Display: 6.8-inch Dynamic AMOLED 2X, 3088x1440 resolution, 120Hz adaptive refresh rate, 2600 nits peak brightness. The display supports S Pen input with 2.8ms latency.",
            ]),
            ("troubleshooting", [
                "Battery draining fast: Go to Settings > Battery > Background usage limits. Enable 'Put unused apps to sleep'. Turn off Always On Display if not needed. Check which app is consuming battery under Settings > Battery > Usage since last full charge.",
                "Phone overheating: Remove phone case during charging. Avoid using the phone in direct sunlight. Close background apps. If temperature exceeds 45°C, the device will automatically reduce performance and brightness to protect hardware.",
                "S Pen not recognized: Remove the S Pen and re-insert fully. Restart the device. If the S Pen tip is worn (after ~4000m strokes), replace it with the included spare tips. Check Settings > Advanced Features > S Pen for connectivity status.",
                "Camera blurry photos: Clean the camera lens with a soft, dry cloth. Ensure the lens cover is not cracked. In Pro mode, check that focus is set to Auto. If software issue, clear Camera app cache: Settings > Apps > Camera > Storage > Clear Cache.",
                "Cannot make calls / No signal: Check if SIM is properly inserted (nano-SIM in slot 1). Try toggling Airplane Mode on and off. Go to Settings > Connections > Mobile Networks > Network Operators and select your carrier manually.",
                "Screen not responding to touch: Restart the device by holding Power + Volume Down for 8 seconds. If using a screen protector, ensure it is compatible with the S24 Ultra. In rare cases, perform a Safe Mode boot (hold Power, then long-press 'Power Off') to check for app conflicts.",
                "Phone won't turn on: Connect to original Samsung charger for at least 15 minutes before attempting to power on. If still unresponsive, perform a force restart: hold Power + Volume Down simultaneously for 8-10 seconds.",
                "Wi-Fi keeps disconnecting: Forget the network and reconnect. Go to Settings > Connections > Wi-Fi > [Network name] > Forget. Set IP settings to Static if DHCP issues persist. Ensure router firmware is updated.",
            ]),
            ("specifications", [
                "Processor: Snapdragon 8 Gen 3 (4nm). RAM: 12GB. Storage: 256GB / 512GB / 1TB (no expandable storage). Water resistance: IP68 (up to 1.5m for 30 minutes).",
                "Cameras: 200MP main (f/1.7, OIS), 50MP periscope telephoto (5x, f/3.4), 10MP telephoto (3x), 12MP ultrawide. Front: 12MP (f/2.2). Max video: 8K@30fps.",
            ]),
            ("maintenance", [
                "Clean the device with a lint-free cloth. Do not use alcohol-based cleaners on the screen. The USB-C port can be cleaned gently with a soft, dry brush.",
                "Software updates: Go to Settings > Software Update > Download and install. Always back up data before major updates. Samsung provides security patches monthly and OS updates for 7 years.",
            ]),
        ]
    }
)


# ═══════════════════════════════════════════════════════════════════════════════
# PRODUCT 2 — Bosch Series 6 Washing Machine
# ═══════════════════════════════════════════════════════════════════════════════
create_product_with_chunks(
    name="Bosch Series 6 Front Load Washer",
    model_number="WAT28492IN",
    category="appliances",
    description="9kg front-loading washing machine with EcoSilence Drive motor, i-DOS automatic detergent dosing, and ActiveOxygen function. Energy rating A+++.",
    image_url="https://media3.bosch-home.com/Images/9999999999999/jpg/WAT28492IN.jpg",
    docs={
        "Bosch Series 6 Washing Machine User Manual": [
            ("general", [
                "Bosch WAT28492IN washing machine: 9kg capacity, 1400 RPM max spin speed, 59.5cm width, 84.8cm height. Connects to cold water supply only. Drain hose max height: 100cm.",
                "Control panel: Power button (top right), Programme dial (centre), Start/Pause button (right of dial), Temperature selector, Spin speed selector, Time Delay button, and i-DOS button.",
                "First use: Run a 90°C programme with no laundry and no detergent to clean the drum. This removes any residue from manufacturing.",
            ]),
            ("troubleshooting", [
                "Error code E18 / F18: Drainage fault. Check that the drain hose is not kinked or blocked. Clean the pump filter located behind the small flap at the bottom front of the machine. Remove any debris or foreign objects (coins, buttons) blocking the pump impeller.",
                "Error code E17 / F17: Water inlet fault. Ensure water supply tap is fully open. Check the inlet hose for kinks. Clean the mesh filter inside the inlet hose connection at the back of the machine using a small brush.",
                "Machine not spinning / Clothes too wet: Check that laundry is not unevenly distributed (single heavy item like a duvet). Reduce load size. Ensure the spin speed is not set to 0 or low. Run a Spin & Drain programme to complete the spin cycle.",
                "Machine vibrating excessively / Walking: Ensure all 4 transport bolts have been removed from the back panel (they are RED plastic bolts shipped for transit). Level the machine using the adjustable feet — all four feet must be firmly on the floor. Lock the feet with the counter nuts.",
                "Door won't open after wash: Wait 2 minutes after the programme ends for the door lock to release. If the drum still has water, the door locks as a safety measure — run a Drain programme first. If door is jammed, pull the emergency release cord (inside the pump filter flap area, behind the small cover).",
                "Machine not starting / No display: Ensure power cable is connected. Check that the door is fully closed until you hear a click. Check household fuse/circuit breaker. Ensure Child Lock is not active (hold the Spin and Temperature buttons simultaneously for 3 seconds to deactivate).",
                "Detergent residue on clothes: Do not overfill the detergent drawer. Use the correct compartment: II (main wash) for powder or liquid. For liquid detergent, use the dosing ball placed inside the drum. Clean the detergent drawer monthly by pulling it fully out and rinsing under warm water.",
                "Bad smell from machine: Run a maintenance wash at 90°C with a drum cleaner or half a cup of white vinegar, no laundry. Clean the door seal (rubber gasket) regularly — wipe dry after every wash to prevent mould. Leave the door slightly ajar between washes.",
                "Machine takes too long: The i-DOS automatic dosing sensor adjusts cycle length based on load. EcoSilence programmes are longer but use less energy — this is normal. Check water inlet pressure (should be 0.5-8 bar). If pressure is low, cycle will take longer.",
            ]),
            ("maintenance", [
                "Clean the pump filter every 3 months or after washing items that shed lint. Location: bottom front panel, small rectangular flap. Steps: (1) Place towel and shallow dish below flap. (2) Turn filter cap anti-clockwise to drain water. (3) Remove filter and clean under running water. (4) Replace and tighten clockwise.",
                "Clean the drum: Use Bosch drum cleaner or run a hot wash monthly. Wipe the door seal after each wash. Clean detergent drawer: remove fully and rinse monthly.",
                "Descaling: In hard water areas, use descaling tablets every 3 months in the drum. Check local water hardness — if above 21°dH, descale more frequently.",
            ]),
            ("specifications", [
                "Rated load: 9kg cotton. Spin speed range: 400-1400 RPM. Programmes: Cotton, EcoCotton, Synthetic, Delicates, Wool, Quick wash 15'/30'/45', SportWear, Dark wash, Drum Clean. Energy consumption: 1.03 kWh (rated load), 0.57 kWh (half load). Water consumption: 49L (rated load).",
            ]),
        ]
    }
)


# ═══════════════════════════════════════════════════════════════════════════════
# PRODUCT 3 — HP LaserJet Pro M404dn
# ═══════════════════════════════════════════════════════════════════════════════
create_product_with_chunks(
    name="HP LaserJet Pro M404dn",
    model_number="W1A53A",
    category="electronics",
    description="38 ppm mono laser printer with automatic duplex printing, Gigabit Ethernet, USB 3.0, and 256MB RAM. Designed for small to medium business use.",
    image_url="https://h20195.www2.hp.com/v2/getjpg.aspx/c07551901.jpg",
    docs={
        "HP LaserJet Pro M404dn User Guide": [
            ("general", [
                "HP LaserJet Pro M404dn (W1A53A): 38 ppm, 1200x1200 dpi, 256MB RAM, 550-sheet input tray + 100-sheet multipurpose tray, auto-duplex, Gigabit Ethernet, USB 3.0 Host. Monthly duty cycle: up to 80,000 pages.",
                "Supported paper sizes: A4, A5, B5, Letter, Legal, Executive, custom (76x127mm to 216x356mm). Supported paper weight: 60-200 g/m² (Tray 1 and 2). Envelope support: C5, C6, DL, B5.",
            ]),
            ("troubleshooting", [
                "Paper jam in Tray 1: Open Tray 1, remove jammed paper by pulling gently in the direction of paper travel. Do not pull backwards as this can leave torn pieces. Open rear door to check for paper in the paper path. Press OK to continue printing.",
                "Paper jam in fuser area: Turn printer OFF and allow to cool for 30 minutes (fuser reaches 200°C during operation). Open rear door. If paper is visible, gently pull it out straight. Check for torn paper pieces inside.",
                "50.X Fuser Error: The fuser is faulty or has reached end of life. Error 50.1 = fuser low temperature, 50.3 = fuser high temperature, 50.4 = fuser drive circuit fault. Turn printer off and back on. If error persists, the fuser assembly (CF064A / CF065A) needs replacement.",
                "Toner low / replace toner: Open the top cover. Remove the CF258A toner cartridge. Gently shake the cartridge side to side 5-6 times to redistribute remaining toner. Reinstall. This can extend cartridge life by up to 10%. Replace with HP 58A (CF258A) for 3000 pages or HP 58X (CF258X) for 10000 pages.",
                "Print quality poor / streaks: Run a Print Quality Diagnostic page: Settings > Reports > Print Quality Diagnostic. If streaks appear, clean the drum by printing several pages. If ghosting (faint repeated image), the drum may need replacement (CF234A drum kit). If background shading, check toner cartridge isn't past end of life.",
                "Printer offline (Windows): Open Control Panel > Devices and Printers. Right-click the printer > See what's printing > Printer > Uncheck 'Use Printer Offline'. Ensure the IP address hasn't changed (DHCP lease) — set a static IP via the printer control panel: Setup > Network Setup > IPv4 Settings > IP Address Method > Static.",
                "Cannot print wirelessly: The M404dn does NOT have Wi-Fi built-in. It supports Gigabit Ethernet only. For wireless printing, connect via Ethernet to your router and use the HP network printer driver. Alternatively use HP Smart app via USB.",
                "Slow printing: Ensure EconoMode is off (it reduces print speed). Change print quality from Best to Normal in print driver. Check that the printer's RAM isn't being exceeded by complex graphics — try rasterizing the document in the application.",
            ]),
            ("maintenance", [
                "Cleaning the printer: Use a dry, lint-free cloth to clean the exterior. For the paper path, use an alcohol-free damp cloth. Clean pickup rollers with isopropyl alcohol on a lint-free cloth when you experience frequent misfeeds.",
                "Calibrate the printer: Settings > Printer Maintenance > Calibrate/Cleaning > Calibrate Scanner (for copying) or Calibrate Printer (for density).",
                "Replace Tray 2 pickup roller (RM2-1492): If Tray 2 regularly misfeeds, the pickup roller needs replacement. Remove Tray 2 fully, locate the roller assembly, press the plastic tab to release and slide off the old roller, snap in the new one.",
            ]),
            ("specifications", [
                "Print speed: 38 ppm (A4). First page out: As fast as 7.4 sec. Warm-up time: 8.2 sec. Processor: 1.2 GHz dual-core. Connectivity: USB 3.0 Type-B, Gigabit Ethernet RJ-45. Compatible toner: HP 58A (CF258A), HP 58X (CF258X), HP 58Y (CF258Y).",
            ]),
        ]
    }
)

print("\n✅ Sample knowledge base seeded successfully!")
print("You now have 3 new published products with full indexed knowledge bases:")
print("  1. Samsung Galaxy S24 Ultra")
print("  2. Bosch Series 6 Washing Machine")
print("  3. HP LaserJet Pro M404dn")
