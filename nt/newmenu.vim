"Publish translation and update pali.
:%s/Esteem for Sangha - Study Sessions/Notes on Dhamma/ge
:norm gg
/sq27
:norm 6dd
:norm k
:r newmenu.list
:%s/sq/nt/ge
