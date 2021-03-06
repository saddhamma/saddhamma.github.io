"Start recording: qf to start, q to end, @f for first play, @@ for subsequent plays
"g/copyrightnote\|creativecommons/d
:%s/The Buddha’s Words/The True Dhamma/g
/topfirst
:r ssg.txt
:%s/\(Bhikkhu Brahmali \.\|Bhikkhu Brahmali\.\|Brahmali Bhikkhu\|Brahmali Bhikkhu\.\|Brahmali Bhikkhu\.\.\|I B Horner\|I\.B\. Horner\.\|I\.B\. Horner with supplementary translation by Bhikkhu Brahmali\.\|Thannissaro Bhikkhu\)/Saddhamma Study Group/g
:norm gg
/div lang="en">
:norm j
:norm ma
/div lang="pi"
?<\/div>
:norm k
:norm mb
:'a,'bd
:w! %:r.raw.html
