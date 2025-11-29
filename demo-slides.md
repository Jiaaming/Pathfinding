---
marp: true
paginate: true
title: Pathfinding Animation Demo
description: CMPT766 Project
---

# Pathfinding Animation

Jiaming Liu 301626723  
### **TL;DR:** I built a small 2D web demo that lets you see how different pathfinding algorithms generate character motion

\
Try it at https://766.jiamingliu.com/ (PC recommended)  

---

![Gemini_Generated_Image_2i6vxi2i6vxi2i6v](https://raw.githubusercontent.com/Jiaaming/blogImage/main/pic/Gemini_Generated_Image_2i6vxi2i6vxi2i6v.png)

---

## Why It Matters

- Think about how characters move in Games 

<table>
<tr>
<td><img src="https://raw.githubusercontent.com/Jiaaming/blogImage/main/pic/20251119102244.png" width="250"></td>
<td><img src="https://raw.githubusercontent.com/Jiaaming/blogImage/main/pic/20251119101744.png" width="450"></td>
</tr>
</table>

- Player clicks a destination → algorithms plan the path → animation runs in real time  
- My project compares several algorithms side by side so we can see the difference


---

## Grid-Based Motion

- Divide space into walkable or blocked tiles  
- Common in RTS, roguelikes, tower-defense, puzzle games  
- Path = list of cells, renderer interpolates for smooth travel  
<table>
<tr>
<td><img src="https://raw.githubusercontent.com/Jiaaming/blogImage/main/pic/20251119102634.png" width="420"></td>
<td><img src="https://raw.githubusercontent.com/Jiaaming/blogImage/main/pic/20251119102812.png" width="420"></td>
</tr>
</table>


---

## NavMesh Motion

* **Efficient Geometry**: Replaces dense grids with simple polygons. Fewer nodes, faster calculation.

* **Fluid Movement**: Enables natural, **any-angle motion** (Standard in *LOL*, *Overwatch*).

<table>
<tr>
<td><img src="https://raw.githubusercontent.com/Jiaaming/blogImage/main/pic/20251122152707.png" width="420"></td>
<td><img src="https://raw.githubusercontent.com/Jiaaming/blogImage/main/pic/Gemini_Generated_Image_q21q40q21q40q21q.png" width="500"></td>
</tr>
</table>

* **Blue Edges**: The walkable mesh boundaries 
*  
---

## Algorithms Included

- **Dijkstra** – Only actual cost, always optimal but slow
- **Greedy Best-First** – Only estimated cost, quick but not always optimal  
- **A\*** – actual cost + estimated cost (StarCraft II, Civilization)  
- **Jump Point Search** – grid optimization verison of A\* 
- **Theta\*** – any-angle grid paths  
- **RRT** – sampling-based, popular in robotics demos but not common in industry  

---

## Compare different algorithms
<img src="https://raw.githubusercontent.com/Jiaaming/blogImage/main/pic/20251122154409.png" width="1000">

