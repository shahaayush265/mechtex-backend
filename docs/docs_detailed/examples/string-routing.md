# Example: String routing through a pulley

This example demonstrates how to describe a routed string that passes over a pulley between two masses.

Paste into the editor:

```
\begin{system}[scale=1.0]
  \ceiling[id=ceil, width=20]{y=8}

  % Suspend pulley from ceiling via a string
  \pulley[id=p1, radius=0.8]{below=ceil.bottom, distance=3, align_x=ceil.center}
  \string[id=sup]{connects=(ceil.center, p1.center)}

  % Block A pulled to the side
  \block[id=a, width=1.6, height=1.6, label_mass=$m_1$]{x=-5, y=0}

  % Block B hanging vertically
  \block[id=b, width=1.6, height=1.6, label_mass=$m_2$]{hang=p1.right, distance=5}

  % Connect them over the pulley
  \string[id=s]{connects=(a.top -> over(p1) -> b.top)}
\end{system}
```

Notes

- `over(p1)` tells the solver to compute tangent points on pulley `p1` so the string wraps correctly.
- Replace `over` with `under` or `vover` for alternative routing behaviors.
