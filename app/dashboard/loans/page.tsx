'use client'
import { useEffect, useState } from 'react'
import { getLoans, getGroupMembers, calcLoan, supabase } from '@/lib/supabase'
import { useActiveGroup } from '../layout'

const C = { bg: '#0B1F3A', card: '#132D4E', border: '#1A3A5C', gold: '#D4A017', muted: '#7A8FA6' }

export default function LoansPage() {
  const { group } = useActiveGroup()
  const isPro = ['pro','elite'].includes(group?.plan)
  if (!isPro) return (
    <div style={{fontFamily:"'Inter',sans-serif",color:'#FFFFFF',padding:'20px',textAlign:'center' as const}}>
      <div style={{fontSize:'48px',marginBottom:'16px'}}>🔒</div>
      <h2 style={{color:'#FFFFFF'}}>Pro Feature</h2>
      <p style={{color:'#7A8FA6'}}>Upgrade to Pro to access loan management.</p>
      <a href="/dashboard/settings" style={{color:'#D4A017'}}>Upgrade →</a>
    </div>
  )
  return (
    <div style={{fontFamily:"'Inter',sans-serif",color:'#FFFFFF'}}>
      <h1 style={{fontSize:'20px',fontWeight:'700',color:'#FFFFFF',margin:'0 0 20px'}}>Loans</h1>
      <p style={{color:'#7A8FA6'}}>Loan management available. Use the dashboard to manage loans.</p>
    </div>
  )
}
