"""
Try-out: record the test sentences with SinhalaVITS (Dialog & University of Moratuwa, MPL-2.0,
https://huggingface.co/dialoglk), to compare with the Microsoft voice by ear.
Writes samples/vits-<voice>-<n>.wav and prints each model's README (for the log).
"""
import glob, json, os, sys, traceback
from huggingface_hub import snapshot_download

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'samples')
os.makedirs(OUT, exist_ok=True)
TEXTS = [
    'ඔහුට මැටි භාජනයක් හමු වුණා.',
    'කපුටා දුර දුරට පියාඹලා වතුර සොයාගෙන ගියා. අවසානයේ ඔහුට මැටි භාජනයක් හමු වුණා. ඒ භාජනයේ ටිකක් වතුර තිබුණා.',
]
for repo in sys.argv[1:]:
    name = repo.split('-')[-1].lower()
    try:
        d = snapshot_download(repo)
        print('=====', repo, sorted(os.listdir(d)))
        for f in glob.glob(os.path.join(d, '*.md')):
            print(open(f, encoding='utf-8').read()[:6000])
        cfg = (glob.glob(os.path.join(d, '**', 'config.json'), recursive=True) or [None])[0]
        ckpt = sorted(glob.glob(os.path.join(d, '**', '*.pth'), recursive=True), key=lambda p: ('best' not in p, p))
        print('config', cfg, 'checkpoints', ckpt)
        if cfg:
            c = json.load(open(cfg, encoding='utf-8'))
            print('characters:', json.dumps(c.get('characters'), ensure_ascii=False)[:1500])
            print('use_phonemes:', c.get('use_phonemes'), 'phonemizer:', c.get('phonemizer'), 'cleaners:', c.get('text_cleaner'))
        from TTS.utils.synthesizer import Synthesizer
        syn = Synthesizer(tts_checkpoint=ckpt[0], tts_config_path=cfg, use_cuda=False)
        for i, t in enumerate(TEXTS, 1):
            wav = syn.tts(t)
            p = os.path.join(OUT, f'vits-{name}-{i}.wav')
            syn.save_wav(wav, p)
            print('recorded', p)
    except Exception:
        traceback.print_exc()
