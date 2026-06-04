import zipfile,xml.etree.ElementTree as ET
p=r"c:\Users\User\Downloads\PROYECTOS\PulseGym\Arquitectuea para PulseGym.docx"
with zipfile.ZipFile(p) as z:
    xml=z.read('word/document.xml')
root=ET.fromstring(xml)
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
texts=[t.text for t in root.findall('.//w:t',ns) if t.text]
print('\n'.join(texts))
