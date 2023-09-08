import React, { useEffect, useState, MutableRefObject } from "react"
import { Text as RNEText } from '@rneui/themed'

interface CountdownTimerProps {
  countdownTimerMinutesRef: MutableRefObject<number>
  countdownTimerSecondsRef: MutableRefObject<number>
  setTimerRunOut: React.Dispatch<React.SetStateAction<boolean>>
  stopCountDown: MutableRefObject<boolean>
  reloadMemoizedCountdownTimer: boolean
}

export default function CountdownTimer({ countdownTimerMinutesRef, countdownTimerSecondsRef, setTimerRunOut, stopCountDown, reloadMemoizedCountdownTimer}:CountdownTimerProps) {
  const [minutes, setMinutes] = useState(countdownTimerMinutesRef.current)
  const [seconds, setSeconds] = useState(countdownTimerSecondsRef.current)

  useEffect(() => {
    let myInterval = null
    if(stopCountDown.current){
      clearInterval(myInterval)
      return
    }else{
      let myInterval = setInterval(() => {
        if (countdownTimerSecondsRef.current > 0) {
          countdownTimerSecondsRef.current = countdownTimerSecondsRef.current - 1
          setSeconds(countdownTimerSecondsRef.current)
        }
        if (countdownTimerSecondsRef.current === 0) {
          if (countdownTimerMinutesRef.current === 0) {
            setTimerRunOut(true)
            clearInterval(myInterval)
          } else {
            countdownTimerMinutesRef.current = countdownTimerMinutesRef.current - 1
            setMinutes(countdownTimerMinutesRef.current)
            countdownTimerSecondsRef.current = 59
            setSeconds(countdownTimerSecondsRef.current)
          }
        }
      }, 1000)
      return () => {
        clearInterval(myInterval)
      }
    }
  }, [reloadMemoizedCountdownTimer])

  return (
    <RNEText style={{ fontSize: 22 }}> {minutes}:{seconds < 10 ? `0${seconds}` : seconds}</RNEText>
  )
}
