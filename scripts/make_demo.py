from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

W,H=1280,720
def F(n,b=False):
    p=r'C:\Windows\Fonts\segoeuib.ttf' if b else r'C:\Windows\Fonts\segoeui.ttf'
    return ImageFont.truetype(p,n) if Path(p).exists() else ImageFont.load_default()
def make(done=False):
    im=Image.new('RGB',(W,H),'#f5f7fa'); d=ImageDraw.Draw(im)
    d.text((44,28),'✦',font=F(28,1),fill='#f0b90b'); d.text((82,28),'SENTINEL ONE',font=F(18,1),fill='#101828'); d.text((82,53),'BINANCE AGENT OS · TRACK A',font=F(12),fill='#667085'); d.text((1020,35),'● READ-ONLY MODE',font=F(12,1),fill='#079455')
    d.text((44,110),'市场风险哨兵',font=F(15,1),fill='#b54708'); d.text((44,145),'让 Agent 提议，',font=F(40,1),fill='#101828'); d.text((315,145),'让策略决定。',font=F(40,1),fill='#b78103'); d.text((44,205),'实时行情 → 官方 Skills → 确定性 Risk Gate → 不可执行计划',font=F(15),fill='#667085')
    d.rounded_rectangle((44,270,350,655),14,fill='white',outline='#e4e7ec'); d.text((68,295),'01  设定观察任务',font=F(14,1),fill='#101828'); d.text((68,350),'交易对        BTCUSDT',font=F(14),fill='#344054'); d.text((68,400),'组合净值      $1,000',font=F(14),fill='#344054'); d.text((68,450),'风险预算      1%',font=F(14),fill='#344054'); d.rounded_rectangle((68,570,326,620),8,fill='#151a23'); d.text((125,585),'运行风险扫描 ↗',font=F(14,1),fill='white')
    d.rounded_rectangle((374,270,1236,655),14,fill='white',outline='#e4e7ec'); d.text((400,295),'02  Agent 决策台',font=F(14,1),fill='#101828'); d.text((1080,298),'AGENT OS MCP',font=F(12,1),fill='#079455')
    if not done:
        d.text((700,410),'◎',font=F(50),fill='#d0d5dd'); d.text((650,480),'准备好扫描市场',font=F(20,1),fill='#344054'); d.text((600,515),'调用官方 Binance Agent OS Skills',font=F(13),fill='#667085')
    else:
        d.text((400,350),'WATCH LONG',font=F(28,1),fill='#079455'); d.text((1100,350),'78%',font=F(28,1),fill='#b78103'); d.text((400,395),'EMA 趋势与 RSI 动量出现共振，等待计划价位附近观察。',font=F(13),fill='#667085');
        for i,(a,b) in enumerate([('现价','$108,420'),('24H 变化','+1.84%'),('RSI 14','58.4'),('ATR 波动','1.12%')]):
            x=400+i*190; d.rounded_rectangle((x,430,x+170,490),8,fill='#f8fafc'); d.text((x+12,442),a,font=F(12),fill='#667085'); d.text((x+12,466),b,font=F(15,1),fill='#101828')
        d.rounded_rectangle((400,515,1210,585),8,fill='white',outline='#d0d5dd'); d.text((420,528),'TRADE PLAN · NON-EXECUTABLE',font=F(12,1),fill='#667085'); d.text((1010,528),'执行权限：关闭',font=F(12,1),fill='#d92d20'); d.text((420,555),'入场 $108,420   止损 $106,991   目标 $111,278',font=F(13),fill='#101828'); d.text((420,615),'趋势一致性  PASS     动量不过热  PASS     仓位符合上限  PASS',font=F(12,1),fill='#079455')
    return im
frames=[make(False)]*20+[make(False)]*10+[make(True)]*70+[make(True)]*20
out=Path('demo'); out.mkdir(exist_ok=True); frames[0].save(out/'sentinel-one-demo.gif',save_all=True,append_images=frames[1:],duration=100,loop=0,optimize=True)
print(out/'sentinel-one-demo.gif')
