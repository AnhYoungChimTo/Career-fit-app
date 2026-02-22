import { Request, Response } from 'express';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ANALYSIS_MODEL = process.env.GPT_ANALYSIS_MODEL || 'gpt-4o';

/**
 * POST /api/quick-analysis
 * Generate a full PHẦN I-V career fit analysis from a free-text self-description.
 * Requires auth. Costs ~1 API call to gpt-4o.
 */
export async function generateQuickAnalysis(req: Request, res: Response) {
  const { userDescription, targetCareer } = req.body;

  if (!userDescription || typeof userDescription !== 'string' || userDescription.trim().length < 50) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Vui lòng mô tả bản thân ít nhất 50 ký tự.' },
    });
  }

  if (!targetCareer || typeof targetCareer !== 'string' || targetCareer.trim().length < 2) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_INPUT', message: 'Vui lòng nhập nghề nghiệp/vị trí mục tiêu.' },
    });
  }

  const career = targetCareer.trim();
  const description = userDescription.trim();

  try {
    console.log(`🔍 Quick analysis requested — target: "${career}" (${description.length} chars)`);

    const completion = await openai.chat.completions.create({
      model: ANALYSIS_MODEL,
      temperature: 0.65,
      max_tokens: 7000,
      messages: [
        {
          role: 'system',
          content:
            'Bạn là chuyên gia tư vấn nghề nghiệp và chiến lược nhân sự hàng đầu Việt Nam. ' +
            'Bạn tạo ra các báo cáo phân tích career fit chính xác, dựa trên bằng chứng, hoàn toàn cá nhân hóa. ' +
            'Mọi điểm số và nhận định phải được suy ra trực tiếp từ mô tả của người dùng — không bao giờ viết chung chung. ' +
            'Thành thật tuyệt đối về điểm yếu và khoảng cách — đây là dịch vụ tư vấn chuyên nghiệp, không phải lời khen ngợi. ' +
            'Tất cả tên công ty, mức lương, khóa học trong báo cáo phải là thông tin thực tế tại thị trường Việt Nam.',
        },
        {
          role: 'user',
          content: `════════════════════════════════════════════════════════════
VÍ DỤ MẪU — ĐỌC KỸ: Đây là CHUẨN ĐỘ SÂU BẮT BUỘC cho mọi phần trong báo cáo.
(Profile mẫu: SV Ngoại Thương ENTJ IELTS 7.5 GPA 3.6 → McKinsey BA)
════════════════════════════════════════════════════════════

PHÂN TÍCH CAREER FIT: [SV Ngoại Thương — ENTJ — IELTS 7.5 — 2 Internships] → BUSINESS ANALYST MCKINSEY VIETNAM

Hồ sơ có ENTJ personality cực kỳ phù hợp với văn hóa consulting (decisive, results-driven, không ngại conflict) và khả năng tiếng Anh đủ chuẩn C-suite presentation ngay từ tháng đầu. Vấn đề cốt lõi: khoảng cách LỚN về business analytics và case-solving frameworks — đây là deal-breaker nếu không được address trong 90 ngày tới; không có shortcut cho bước này.

PHẦN I: INPUT ANALYSIS (CÁI BẠN CÓ)

A. PERSONAL ATTRIBUTES: 8.1/10
A1. TÍNH CÁCH & PHONG CÁCH LÀM VIỆC (8.5/10)
├─ ENTJ "The Commander" — Decisive under ambiguity, frames problems top-down, natural authority presence
├─ Phong cách: Hypothesis-first thinking, drives team execution, low tolerance for inefficiency and ambiguity
├─ Điểm MẠNH cho McKinsey: ENTJ chiếm ~22% partner level tại Big 3 VN; "GSD" (Get Stuff Done) culture của McKinsey ăn khớp hoàn toàn với ENTJ drive
├─ Thách thức: Nguy cơ skip empathy step trong client discovery interviews — ENTJ hay go straight to solution trước khi client cảm thấy được lắng nghe; cần luyện "soft open" technique
└─ FIT FOR McKINSEY BA: 8.5/10

A2. TÀI NĂNG TỰ NHIÊN (7.8/10)
├─ Analytical: GPA 3.6 tại FTU (curriculum cạnh tranh top 5 VN) → strong deductive reasoning; viết policy brief cho ĐSQ → structured synthesis under constraints
├─ Communication: IELTS 7.5 Speaking = đủ chuẩn facilitate workshop với C-suite foreign clients từ ngày 1; Writing 7.0 đủ để viết executive summary deliverables
├─ Learning agility: 2 ngành internship hoàn toàn khác nhau (diplomacy vs. media) trong 5 tháng → adaptable, fast pattern recognizer
└─ Transfer to Consulting: Policy research methodology → primary research; cross-cultural sensitivity → global project teams; media deadline pressure → operational resilience

A3. GIÁ TRỊ CỐT LÕI (7.8/10)
├─ Work intensity: ENTJ chấp nhận 65-80h/tuần nếu thấy impact rõ ràng — phù hợp consulting lifestyle (thực tế BA McKinsey VN làm 55-70h/tuần)
├─ Impact vs. income: Mục tiêu McKinsey thay vì IB/tech (lương cao hơn) → impact-oriented → alignment tốt với McKinsey's "make lasting impact" mission
├─ Growth vs. stability: Up-or-out model phù hợp với ENTJ competitive mindset — promotion hoặc exit strategy đều rõ ràng, không có zone of mediocrity
└─ Values alignment: HIGH — cả hai ưu tiên intellectual rigor, client impact, và fast career progression

SCORING A: (8.5×0.40) + (7.8×0.35) + (7.8×0.25) = 3.40 + 2.73 + 1.95 = 8.08/10
VERDICT: Tính cách và giá trị phù hợp XUẤT SẮC với consulting — ENTJ là type có tỷ lệ vào Big 3 cao nhất. Rủi ro thực sự duy nhất là ENTJ tendency to prioritize efficiency over empathy; cần chủ động luyện client-centric listening trong mock interviews.

B. PROFESSIONAL CAPABILITIES: 6.7/10
B1. KIẾN THỨC CHUYÊN MÔN (6.0/10)
├─ MẠNH: International policy analysis, geopolitics, media/communication theory, cross-cultural dynamics, diplomatic protocol — tất cả có value trong public sector consulting hoặc international organization projects
├─ 🚨 GAP NGHIÊM TRỌNG #1: Business strategy foundations (Porter 5 Forces, McKinsey 7S, BCG Matrix, Value Chain) — không có trong chương trình QHQT → phải tự học từ đầu
├─ 🚨 GAP NGHIÊM TRỌNG #2: Finance fundamentals — chưa thể đọc P&L, balance sheet, cash flow statement → không thể solve profitability cases (chiếm ~35% case interview bank)
└─ Mức phù hợp: 6.0/10 — social sciences nền tốt nhưng thiếu nặng về business + quant foundation; 3 tháng học tập tập trung có thể bridge gap

B2. BỘ KỸ NĂNG (7.0/10)
├─ Hard skills có: Research synthesis & primary research (ĐSQ), bilingual writing EN/FR (tiếng Pháp bonus với EU clients), stakeholder communication, Powerpoint storytelling
├─ Soft skills: Cross-cultural agility (đặc biệt quý trong McKinsey's diverse team environment), structured presentation, team leadership potential, diplomatic communication under pressure
├─ Tools hiện tại: MS Office suite intermediate, Google Suite; chưa có Excel advanced (VLOOKUP, Pivot, financial model)
├─ 🚨 GAPS CẤP BÁCH: (1) Case interview MECE framework — zero exposure, phải luyện từ zero; (2) Excel financial modeling (DCF, sensitivity analysis, scenario planning) — bắt buộc từ tuần 1 onboarding; (3) Data storytelling với biểu đồ định lượng — chưa có habit
└─ Risk thực tế: Nếu vào BA McKinsey mà không có Excel financial modeling, sẽ không thể deliver workstream độc lập sau 2 tuần — đây là gap cần xử lý TRƯỚC khi apply, không phải sau khi được nhận

B3. CHẤT LƯỢNG KINH NGHIỆM (7.2/10)
├─ ĐSQ Pháp 3 tháng: Policy research, diplomatic communication, cross-cultural stakeholder management → HIGH VALUE cho research-heavy modules của McKinsey
├─ VnExpress 2 tháng: Content production under tight deadlines, editorial judgment, audience-centric writing → operational resilience và communication skills
├─ Relevance to Consulting: 60% — có research + comm skills nhưng thiếu P&L ownership và business problem-solving in commercial context
└─ Accelerator: 1 internship tại KPMG Advisory, Deloitte Consulting, hoặc FTI Consulting Vietnam (3 tháng) sẽ bridge commercial gap nhanh hơn 6 tháng tự học

SCORING B: (6.0×0.30) + (7.0×0.40) + (7.2×0.30) = 1.80 + 2.80 + 2.16 = 6.76/10
VERDICT: Năng lực nền TỐT nhưng có khoảng trống nghiêm trọng về business analytics và case frameworks. Cần lấp đầy business fundamentals + case solving trước khi apply — không có shortcut. Nếu không bridge gaps này trong 3 tháng tới, xác suất pass McKinsey final round < 15%.

[... C, D với độ sâu tương đương ...]

G. THU NHẬP FIT: 8.5/10
├─ G1. Lương McKinsey Vietnam 2025 cho Business Analyst (9.0/10)
│   McKinsey Vietnam BA (0-2 năm): 55-70 triệu VND/tháng (base salary)
│   BCG Vietnam Analyst: 48-62 triệu VND/tháng
│   Bain Vietnam Case Team Associate: 45-58 triệu VND/tháng
│   Roland Berger Vietnam (entry): 35-45 triệu VND/tháng
│   Big4 Advisory entry (KPMG, Deloitte, EY): 20-35 triệu VND/tháng (stepping stone)
│   → Top 3% thu nhập fresh graduate Việt Nam 2025; ROI vượt trội so với 3-6 tháng effort chuẩn bị
├─ G2. Tổng đãi ngộ McKinsey (9.0/10)
│   Performance bonus: 15-25% base (McKinsey trả theo individual + team performance)
│   Learning & development stipend: $1,500-2,000 USD/năm cho professional development
│   International staffing: 20-30% chance được staffed trên regional/global projects (Singapore, Bangkok, Hong Kong)
│   Alumni network value: McKinsey alumni network tại VN = >200 người ở C-suite → exit opportunities premium
└─ G3. An toàn tài chính (7.5/10)
   McKinsey VN có ~45-55 BA headcount — stable team size nhưng up-or-out sau 2-3 năm là rủi ro thực; cần plan exit strategy từ đầu

PHẦN IV: KẾ HOẠCH HÀNH ĐỘNG 6 THÁNG
(100% cụ thể — tên khóa học thực, nền tảng thực, công ty tại VN thực)

THÁNG 1-2: XÂY DỰNG NỀN TẢNG — Business Fundamentals & Case Solving Framework
├─ Tuần 1-2: Đọc toàn bộ "Case In Point" (Marc Cosentino, 11th Edition) — mua tại Fahasa 250K hoặc tải PDF
│   + Xem playlist "McKinsey Problem Solving" trên YouTube (McKinsey Official, miễn phí, 8 videos ~40 phút)
│   + Enroll "Business Foundations Specialization" (Wharton/Coursera, free audit): Course 1 - Introduction to Marketing
├─ Tuần 3-4: Luyện 3 cases/tuần trên prepLounge.com (free tier: 20 cases/tháng)
│   Focus: Market Entry (3 cases) + Profitability (3 cases) — 2 framework phổ biến nhất
│   + Enroll "Excel Skills for Business" (Macquarie University/Coursera, free audit): hoàn thành Module 1-4
├─ Tuần 5-6: Khai thác 2 contact McKinsey/BCG hiện có để xin coffee chat + mock interview 30 phút
│   Template email: "Anh/chị ơi, em đang chuẩn bị apply [firm]. Anh/chị có thể cho em 30 phút mock case không?"
│   + Xây 1 mini case study về Vinamilk 2024: Porter 5 Forces + 3C + đề xuất chiến lược (3 slide Powerpoint)
└─ Tuần 7-8: Attempt McKinsey Solve simulation tại mckinsey.com/careers (bắt buộc trước khi apply chính thức)
   + Tham gia Vietnam Consulting Club (Facebook group, >5,000 members) để tìm practice partner
Milestone: 15 practice cases completed; Excel Intermediate (Pivot Table, VLOOKUP); McKinsey Solve attempted lần 1; 2 coffee chats done

THÁNG 3-4: PHÁT TRIỂN KỸ NĂNG CỐT LÕI — Financial Modeling & Industry Knowledge
├─ Khóa học: "Financial Modeling & Valuation Analyst" (CFI, free tier) — focus DCF và Comparable Company Analysis
├─ Portfolio: Xây 1 financial model đơn giản cho FPT Software (báo cáo tài chính public) — mục tiêu: đọc được P&L + dự báo revenue
├─ Industry deep dive: Chọn 1 sector VN đang sôi động (retail, F&B, hoặc fintech) — đọc 10 industry reports (McKinsey, Deloitte, KPMG Vietnam đều có free reports)
└─ Network: Tham gia 2 events tại YBA Vietnam (Young Business Association) hoặc Vietnam CEO Forum để gặp potential references
Milestone: Financial model hoàn chỉnh cho 1 công ty thực; 1 industry research deck 10 slides; network thêm 5 contacts trong lĩnh vực

THÁNG 5-6: ỨNG TUYỂN & THỰC THI
├─ CV: Rewrite theo "achievement format" — mỗi bullet dùng "X → Y → Z" (action → method → impact với số liệu)
│   Highlight: ĐSQ Pháp policy research + IELTS 7.5 + case study projects
├─ Interview prep: 3 mock cases/tuần với practice partner; luyện "Fit interview" stories (5 stories STAR format cho McKinsey PEI)
├─ Applications: Nộp theo thứ tự — Roland Berger VN (easiest entry) → Big4 Advisory → Bain → BCG → McKinsey
│   Deadline tracking: McKinsey VN thường recruit tháng 9-10 (cho start date tháng 1-2 năm sau)
└─ Network activation: Nhờ 2 contact McKinsey/BCG viết internal referral nếu có quan hệ đủ tốt sau 4 tháng nurture
Milestone: 3+ applications submitted; 2+ interviews secured; offer từ ít nhất 1 Big4 Advisory (backup option)

PHẦN V: QUẢN LÝ RỦI RO & PHƯƠNG ÁN DỰ PHÒNG

KỊCH BẢN A: Vào được McKinsey Vietnam BA ✓
└─ Năm 1-2: BA role, staffed 60% local + 40% regional projects; target "top performer" rating
   Năm 3: Lên Associate hoặc MBA-track (McKinsey thường sponsor MBA top 5 cho top performers)
   Exit options (nếu không lên được): Startup COO, Corporate Strategy Manager tại Vingroup/Masan/FPT, PE/VC Analyst

KỊCH BẢN B: Không vào được McKinsey/BCG/Bain sau 6 tháng ✗
├─ Nguyên nhân khả năng cao nhất: Case interview performance không đủ (case là 80% của quyết định hire)
└─ Plan B: Nhận offer Big4 Advisory (KPMG/Deloitte VN) → build 1-2 năm commercial experience → re-apply Big 3 với hồ sơ "experienced hire"

KỊCH BẢN C: Nghề nghiệp thay thế (phù hợp với profile ENTJ + QHQT + IELTS 7.5)
├─ Government Affairs / Public Policy Manager (Grab, Google, Meta VN) — Lý do: QHQT background + tiếng Anh C1 = rare combo; lương 35-55 triệu
├─ Strategy & Business Development Manager tại MNC — Lý do: ENTJ + analytical skills fit; nhiều vị trí tại Unilever, P&G, Nestlé VN
└─ International Organization (UN, IFC, ADB Vietnam) — Lý do: ĐSQ experience + đa ngôn ngữ + policy background; entry-level 30-40 triệu + benefits tốt

════════════════════════════════════════════════════════════
HẾT VÍ DỤ MẪU — bây giờ tạo báo cáo HOÀN CHỈNH với ĐỘ SÂU TƯƠNG ĐƯƠNG cho user thực tế bên dưới.
QUAN TRỌNG: Mọi số liệu, tên công ty, lương, khóa học phải phù hợp với nghề "${career}" thực tế tại VN 2025.
════════════════════════════════════════════════════════════

=== MÔ TẢ BẢN THÂN ===
${description}

=== NGHỀ NGHIỆP / VỊ TRÍ MỤC TIÊU ===
${career}

────────────────────────────────────────────────────
PHÂN TÍCH CAREER FIT: [TÓM TẮT HỒ SƠ] → ${career.toUpperCase()}
[Intro 2-3 câu CỤ THỂ: điểm nổi bật THỰC SỰ từ mô tả + thách thức THỰC SỰ của case này]

PHẦN I: INPUT ANALYSIS (CÁI BẠN CÓ)

A. PERSONAL ATTRIBUTES: [X.X/10]
A1. TÍNH CÁCH & PHONG CÁCH LÀM VIỆC ([score]/10)
├─ Personality type / MBTI: [phân tích CỤ THỂ từ mô tả — nếu không có MBTI thì suy luận từ phong cách mô tả]
├─ Phong cách làm việc & giải quyết vấn đề: [2-3 điểm cụ thể dẫn từ mô tả]
├─ Điểm mạnh tính cách cho nghề ${career}: [liên kết rõ ràng với yêu cầu nghề này]
├─ Thách thức tiềm ẩn: [điểm yếu tính cách cụ thể có thể cản trở trong ${career}]
└─ FIT FOR ${career.toUpperCase()}: [X/10]

A2. TÀI NĂNG TỰ NHIÊN ([score]/10)
├─ Cognitive strengths (dẫn chứng từ học vấn/kinh nghiệm): [cụ thể]
├─ Communication & presentation: [cụ thể — ngôn ngữ, phong cách, bằng chứng]
├─ Learning agility & adaptability: [dẫn chứng từ trajectory của user]
└─ Kỹ năng chuyển đổi sang ${career}: [cụ thể — kỹ năng nào transfer được và tại sao]

A3. ĐỊNH GIÁ TRỊ CỐT LÕI ([score]/10)
├─ Work-life balance priority: [suy ra từ mô tả hoặc mục tiêu]
├─ Impact vs. income orientation: [phân tích cụ thể]
├─ Stability vs. growth preference: [phân tích cụ thể]
└─ Alignment với đặc thù nghề ${career}: [nhận xét cụ thể về mức độ match]

SCORING A: (A1 × 0.40) + (A2 × 0.35) + (A3 × 0.25) = [tính toán chi tiết] = X.X/10
VERDICT: [2 câu nhận xét CỤ THỂ — PHẢI DẪN CHỨNG TỪ MÔ TẢ, không viết chung chung]

B. PROFESSIONAL CAPABILITIES: [X.X/10]
B1. KIẾN THỨC CHUYÊN MÔN ([score]/10)
├─ Lĩnh vực kiến thức MẠNH (dẫn từ học vấn/kinh nghiệm): [liệt kê cụ thể]
├─ 🚨 KHOẢNG TRỐNG QUAN TRỌNG cần lấp đầy: [liệt kê 2-3 gaps cụ thể với tên môn/lĩnh vực]
└─ Mức độ phù hợp tổng thể với yêu cầu nghề: [phần trăm và giải thích]

B2. BỘ KỸ NĂNG ([score]/10)
├─ Hard skills đang có: [liệt kê cụ thể từ mô tả]
├─ Soft skills nổi bật: [liệt kê cụ thể]
├─ Tools/Technical hiện tại: [liệt kê cụ thể]
└─ 🚨 Gaps cần phát triển gấp: [liệt kê CỤ THỂ 2-4 gaps quan trọng nhất — không viết "cần học thêm chuyên môn"]

B3. CHẤT LƯỢNG KINH NGHIỆM ([score]/10)
├─ Kinh nghiệm thực tế tích lũy: [từng vị trí + đánh giá chất lượng]
├─ Mức độ liên quan đến ${career}: [phần trăm + giải thích cụ thể]
└─ Tiềm năng tăng tốc: [bước tiếp theo để tăng relevance nhanh nhất]

SCORING B: (B1 × 0.30) + (B2 × 0.40) + (B3 × 0.30) = [tính toán] = X.X/10
VERDICT: [2 câu THÀNH THẬT về năng lực — nêu rõ gaps quan trọng nhất không được che giấu]

C. VỐN XÃ HỘI: [X.X/10]
C1. MẠNG LƯỚI QUAN HỆ ([score]/10)
├─ Breadth: [độ rộng mạng lưới từ mô tả — bao nhiêu ngành, bao nhiêu người]
├─ Depth: [độ sâu — quan hệ bề mặt hay có thể nhờ favor]
└─ Chất lượng cho ${career}: [có ai trong mạng lưới thuộc ngành ${career} không]

C2. TIỀM NĂNG REFERRAL ([score]/10)
├─ Khả năng được giới thiệu: [đánh giá thực tế từ mạng lưới hiện có]
└─ Chiến lược khai thác: [cách tận dụng mạng lưới hiện có để vào ${career}]

C3. THƯƠNG HIỆU & DANH TIẾNG CÁ NHÂN ([score]/10)
├─ Brand từ học vấn: [trường, GPA, thành tích nổi bật]
└─ Hiện diện trong lĩnh vực: [LinkedIn, publications, community involvement]

SCORING C: (C1 × 0.35) + (C2 × 0.35) + (C3 × 0.30) = [tính toán] = X.X/10
VERDICT: [2 câu — nêu lợi thế hoặc điểm cần cải thiện CỤ THỂ]

D. ĐỊNH VỊ THỊ TRƯỜNG: [X.X/10]
D1. KỸ NĂNG PHỎNG VẤN & TRÌNH BÀY ([score]/10)
├─ Interview readiness: [đánh giá từ communication skills, kinh nghiệm trình bày trong mô tả]
└─ Loại phỏng vấn của ${career}: [mô tả quy trình phỏng vấn thực tế của nghề này tại VN]

D2. CHIẾN LƯỢC TÌM VIỆC ([score]/10)
├─ Chuẩn bị hiện tại: [đánh giá từ mô tả]
└─ Điểm cần cải thiện: [cụ thể]

D3. THỜI ĐIỂM THỊ TRƯỜNG VIETNAM 2025-2026 ([score]/10)
├─ Cầu: [nhu cầu tuyển dụng ${career} tại VN — Hà Nội vs TP.HCM — với số liệu thực tế nếu có]
└─ Cung: [mức độ cạnh tranh, số lượng ứng viên cùng background]

SCORING D: (D1 × 0.40) + (D2 × 0.40) + (D3 × 0.20) = [tính toán] = X.X/10
VERDICT: [2 câu CỤ THỂ]

TỔNG ĐIỂM INPUT
INPUT = (A × 0.25) + (B × 0.35) + (C × 0.20) + (D × 0.20) = [tính toán đầy đủ] = X.X/10 → XX/100

PHẦN II: OUTPUT ANALYSIS (NGHỀ ${career.toUpperCase()} MANG LẠI GÌ)

E. BẢN CHẤT CÔNG VIỆC FIT: [X.X/10]
├─ E1. Nội dung công việc hàng ngày vs hoạt động tạo năng lượng ([score]/10)
│   [Mô tả 1 ngày làm việc thực tế của ${career} tại VN — so sánh với profile user]
├─ E2. Áp lực & trách nhiệm vs khả năng chịu đựng ([score]/10)
│   [KPI, deadline, scope thực tế — đánh giá fit với stress tolerance của user]
└─ E3. Lộ trình thăng tiến vs mục tiêu dài hạn ([score]/10)
   [Career ladder thực tế của ${career} tại VN — phù hợp với mục tiêu user không]
SCORING E: (E1×0.40) + (E2×0.30) + (E3×0.30) = [tính toán] = X.X/10

F. MÔI TRƯỜNG LÀM VIỆC FIT: [X.X/10]
├─ F1. Văn hóa tổ chức vs phong cách ưa thích ([score]/10)
│   [Văn hóa điển hình của công ty/ngành ${career} — so sánh với phong cách user]
├─ F2. Team structure vs sở thích cộng tác ([score]/10)
└─ F3. Work schedule, remote flexibility, location ([score]/10)
   [Thực tế giờ làm + remote policy cho ${career} tại VN]
SCORING F: (F1×0.40) + (F2×0.35) + (F3×0.25) = [tính toán] = X.X/10

G. THU NHẬP FIT: [X.X/10]
├─ G1. Lương cơ bản Vietnam 2025 cho ${career} ([score]/10)
│   [PHẢI nêu mức lương CỤ THỂ: X - Y triệu VND/tháng — ít nhất 3 mức theo cấp bậc]
├─ G2. Tổng đãi ngộ (bonus, benefits, tăng trưởng) ([score]/10)
│   [Bonus %, benefits, learning stipend, long-term upside — cụ thể theo ngành]
└─ G3. An toàn tài chính & ổn định nghề ([score]/10)
   [Job security, automation risk, market demand dài hạn]
SCORING G: (G1×0.35) + (G2×0.40) + (G3×0.25) = [tính toán] = X.X/10

H. NGÀNH & VAI TRÒ FIT: [X.X/10]
├─ H1. Phù hợp với ngành/lĩnh vực ([score]/10)
├─ H2. Phù hợp cấp bậc và scope ([score]/10)
└─ H3. Nhu cầu thị trường VN 2025-2026 ([score]/10)
SCORING H: (H1×0.35) + (H2×0.35) + (H3×0.30) = [tính toán] = X.X/10

I. CÔNG TY & ĐỊA ĐIỂM FIT: [X.X/10]
├─ I1. Công ty tiêu biểu đang tuyển ${career} tại VN ([score]/10)
│   [NÊU ĐỦ 4-6 TÊN CÔNG TY THỰC TẾ đang tuyển ${career} tại VN — không liệt kê công ty không liên quan]
├─ I2. Hà Nội / TP.HCM — cơ hội địa lý ([score]/10)
│   [So sánh cơ hội + lương giữa 2 thành phố]
└─ I3. Thương hiệu & exit opportunities ([score]/10)
   [Giá trị long-term của brand name trong ngành — exit options sau 2-3 năm]
SCORING I: (I1×0.45) + (I2×0.30) + (I3×0.25) = [tính toán] = X.X/10

TỔNG ĐIỂM OUTPUT
OUTPUT = (E×0.30) + (F×0.25) + (G×0.25) + (H×0.10) + (I×0.10) = [tính toán đầy đủ] = X.X/10 → XX/100

PHẦN III: KẾT QUẢ PHÂN TÍCH CUỐI CÙNG

KIỂM TRA CỬA (Deal-breakers):
✓/✗ [6-7 điều kiện tiên quyết quan trọng nhất của ${career} — kiểm tra thực tế với profile user, đánh dấu ✓ nếu đáp ứng, ✗ nếu chưa]

TÍNH ĐIỂM FIT:
Base (Hybrid Method) = (INPUT × 0.40) + (OUTPUT × 0.60) = [tính toán] = XX/100

ĐIỀU CHỈNH (dẫn chứng TRỰC TIẾP từ profile):
[+X%] [Lợi thế cụ thể #1 — tên đặc điểm + lý do tăng điểm]
[+X%] [Lợi thế cụ thể #2]
[+X%] [Lợi thế cụ thể #3]
[-X%] [Gap quan trọng #1 — tên gap + mức độ ảnh hưởng]
[-X%] [Gap quan trọng #2]
[±X%] Serendipity / Yếu tố thị trường VN 2025

ĐIỂM ĐIỀU CHỈNH = XX × [1.XX hoặc 0.XX] = XX/100

╔══════════════════════════════════════════════╗
║  QUYẾT ĐỊNH: [STRONG YES / YES / MAYBE / NO]  ║
║  ${career} = [MỨC ĐỘ NÊN THEO ĐUỔI]          ║
╚══════════════════════════════════════════════╝
[3-4 câu lý do CỤ THỂ — dẫn chứng từ profile, không viết chung chung]

XÁC SUẤT THÀNH CÔNG:
├─ Không chuẩn bị gì thêm: XX-XX%
├─ Sau 3-6 tháng prep theo kế hoạch: XX-XX%
└─ Sau 12 tháng prep đầy đủ + 1 stepping stone: XX-XX%

PHẦN IV: KẾ HOẠCH HÀNH ĐỘNG 6 THÁNG
(100% cụ thể — tên tài nguyên thực, công ty tại VN thực, deadline thực)

THÁNG 1-2: XÂY DỰNG NỀN TẢNG — [Chủ đề cụ thể nhắm đúng gap #1 quan trọng nhất]
├─ Tuần 1-2: [Hành động cụ thể] + [Tên tài nguyên thực: sách/khóa học/nền tảng + link/giá nếu có]
├─ Tuần 3-4: [Hành động cụ thể] + [Tài nguyên]
├─ Tuần 5-6: [Hành động cụ thể] + [Tài nguyên]
└─ Tuần 7-8: [Hành động cụ thể] + [Tài nguyên]
Milestone: [Kết quả đo lường được cần đạt sau tháng 1-2]

THÁNG 3-4: PHÁT TRIỂN KỸ NĂNG CỐT LÕI — [Chủ đề nhắm gap #2]
├─ [Hành động + tài nguyên cụ thể]
├─ [Portfolio/project cụ thể cần xây: tên project + deliverable]
└─ [Kết nối mạng lưới: tên tổ chức/event/cộng đồng cụ thể tại VN]
Milestone: [Kết quả đo lường được]

THÁNG 5-6: ỨNG TUYỂN & THỰC THI
├─ CV: [Điểm cụ thể cần cập nhật dựa trên profile — không nói chung chung]
├─ Interview prep: [Loại phỏng vấn thực tế của ${career} + cách luyện cụ thể]
├─ Applications: [4-6 tên công ty cụ thể nên apply theo thứ tự ưu tiên]
└─ Network: [Tên tổ chức/người/event cụ thể để khai thác]
Milestone: [Mục tiêu cụ thể: X applications, Y interviews, Z offers]

PHẦN V: QUẢN LÝ RỦI RO & PHƯƠNG ÁN DỰ PHÒNG

KỊCH BẢN A: Kế hoạch chính thành công ✓
└─ [Lộ trình 2-3 năm trong ${career}: promotion path, skill development, exit options với tên công ty/role cụ thể]

KỊCH BẢN B: Không vào được ${career} sau 6 tháng ✗
├─ Nguyên nhân khả năng cao nhất: [dẫn từ gaps đã phân tích]
└─ Plan B cụ thể: [stepping stone role + tên công ty thực tế tại VN → timeline để re-apply]

KỊCH BẢN C: Nghề nghiệp thay thế (phù hợp với profile của user này)
├─ [Nghề thay thế #1] — Tại sao phù hợp với MÔ TẢ CỤ THỂ CỦA USER: ...
├─ [Nghề thay thế #2] — Tại sao phù hợp: ...
└─ [Nghề thay thế #3] — Tại sao phù hợp: ...

────────────────────────────────────────────────────
QUY TẮC BẮT BUỘC — VI PHẠM SẼ LÀM BÁO CÁO VÔ GIÁ TRỊ:
• TUYỆT ĐỐI không viết chung chung — mọi câu phải dẫn chứng từ mô tả của user
• Mọi điểm số phải có phép tính VÀ giải thích lý do — không cho điểm tự tiện
• Thành thật tuyệt đối về gaps — KHÔNG làm nhẹ điểm yếu để tránh làm user buồn
• Tất cả công ty, lương, khóa học là thông tin thực tế VN 2025 — không bịa
• Action plan phải nhắm đúng GAPS CỤ THỂ của người này — không copy template chung`,
        },
      ],
    });

    const analysis = completion.choices[0].message.content || '';
    console.log(`✅ Quick analysis generated (${analysis.length} chars, model: ${ANALYSIS_MODEL})`);

    return res.json({
      success: true,
      data: { analysis },
    });
  } catch (error: any) {
    console.error('❌ Quick analysis error:', error.message || error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'ANALYSIS_FAILED',
        message: 'Không thể tạo phân tích lúc này. Vui lòng thử lại.',
      },
    });
  }
}
