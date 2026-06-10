$code = @'
'use client'
import { useEffect, useState } from 'react'
import { getLoans, getGroupMembers, calcLoan, supabase } from '@/lib/supabase'
import { useActiveGroup } from '../layout'

const C = { bg: '#0B1F3A', card: '#132D4E', border: '#1A3A5C', gold: '#D4A017', text: '#D6DCE5', muted: '#7A8FA6' }

export default function LoansPage() {
  const { group } = useActiveGroup()
  return (
    <div style={{fontFamily:"'Inter',sans-serif",color:'#FFFFFF',padding:'20px'}}>
      <h1 style={{fontSize:'20px',fontWeight:'700',color:'#FFFFFF'}}>Loans</h1>
      <p style={{color:'#7A8FA6'}}>Loan management coming soon.</p>
    </div>
  )
}
'@
Set-Content app\dashboard\loans\page.tsx $code