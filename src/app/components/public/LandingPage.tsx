import { Link } from 'react-router'
import { Palette, Monitor, Video, Box, Star, Shield, Zap, Users } from 'lucide-react'

const FEATURES = [
  { icon: Users,   title: '厳選されたクリエイター', desc: '審査済みのプロフェッショナルクリエイターが多数登録。スキルと実績で最適な人材を見つけられます。' },
  { icon: Shield,  title: '安心の契約サポート', desc: '案件のマッチングから契約・支払いまで管理画面で一元管理。トラブルを未然に防ぐサポート体制。' },
  { icon: Zap,     title: 'スピーディな対応', desc: '即日対応可能なクリエイターも多数。急ぎの案件にも柔軟に対応できる体制を整えています。' },
]

const CATEGORIES = [
  { icon: Palette, label: 'イラスト・キャラクターデザイン' },
  { icon: Monitor, label: 'WEBデザイン・UI/UX' },
  { icon: Video,   label: '動画・映像制作' },
  { icon: Box,     label: '3DCG・アニメーション' },
]

const STATS = [
  { value: '500+', label: '登録クリエイター' },
  { value: '1,200+', label: '完了案件数' },
  { value: '98%', label: 'クライアント満足度' },
  { value: '4.8', label: '平均評価スコア' },
]

export function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-sm px-4 py-1.5 rounded-full mb-6">
            <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            クリエイティブ案件マッチングプラットフォーム
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
            クリエイターと企業を<br />つなぐ、新しいカタチ
          </h1>
          <p className="text-lg text-indigo-100 mb-10 max-w-xl mx-auto leading-relaxed">
            イラスト・映像・デザインなど、あらゆるクリエイティブな仕事をスムーズに依頼・受注できるプラットフォームです。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register/creator"
              className="px-8 py-3.5 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
            >
              クリエイターとして登録
            </Link>
            <Link
              to="/register/client"
              className="px-8 py-3.5 bg-indigo-500 text-white font-semibold rounded-xl border border-indigo-400 hover:bg-indigo-400 transition-colors"
            >
              発注者として登録
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-indigo-600">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">豊富なカテゴリ</h2>
          <p className="text-gray-500 text-center text-sm mb-10">あらゆるクリエイティブニーズに対応</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map(c => (
              <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-md hover:border-indigo-200 transition-all cursor-default">
                <c.icon className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">選ばれる理由</h2>
          <p className="text-gray-500 text-center text-sm mb-12">CreativeCrewが支持される3つのポイント</p>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map(f => (
              <div key={f.title} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-20 text-white text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-3">さっそく始めよう</h2>
          <p className="text-indigo-200 mb-8 text-sm">登録は無料です。今すぐアカウントを作成してください。</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register/creator"
              className="px-8 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
            >
              クリエイターとして登録
            </Link>
            <Link
              to="/register/client"
              className="px-8 py-3 border border-white/50 text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              発注者として登録
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
