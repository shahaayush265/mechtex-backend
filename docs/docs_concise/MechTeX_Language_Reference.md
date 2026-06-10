# MechTeX Language Reference: In-Depth Guide

MechTeX is a custom, strict LaTeX-like language designed to declaratively model and render mechanical systems and physical diagrams. This document provides an exhaustive, granular reference of the language's grammar, available components, properties, constraints, and valid anchor points based on the underlying parser (`mechtex.ne`) and solver (`solver.ts`).

---

## 🚨 Common Mistakes to Avoid 🚨

To prevent syntax errors and frustrating debugging, **never** make the following common mistakes:

1. **Spaces in Property Values**: The lexer does NOT support unquoted spaces in text values. 
   - ❌ **WRONG**: `\label[text=Frictionless Surface]{at=ramp.center}` (Throws "Unexpected word token")
   - ✅ **CORRECT**: `\label[label=$\text{Frictionless Surface}$]{at=ramp.center}`
2. **Wrapping Simple Anchors in Objects**: Unless you are passing extra parameters like friction (`mu`), **never** wrap an anchor reference in an object expression.
   - ❌ **WRONG**: `hang={id=ceil1, anchor=bottom}`
   - ✅ **CORRECT**: `hang=ceil1.bottom`
   - ❌ **WRONG**: `at={anchor=top.surface}`
   - ✅ **CORRECT**: `at=top.surface`
3. **Using `\label` for Vectors**: Do not spawn a separate `\label` component to name a force vector. Vectors support the `label` property natively.
   - ❌ **WRONG**: `\vector[...]{...} \label[text=$N$]{at=v1.top}`
   - ✅ **CORRECT**: `\vector[label=$N$, ...]{...}`

---

## 1. Syntax & Document Structure

Every MechTeX system must be enclosed within a `\begin{system}` and `\end{system}` block. The system block can take global properties.

```latex
\begin{system}[scale=1.0, group=main]
  % Comments start with a percent sign. Whitespace is largely ignored.
  \floor[id=gnd]{y=-8}
  \block[id=m1, width=2, height=2]{on=gnd.surface}
\end{system}
```

### 1.1 Statements
Each component in the system is defined by a statement with the following format:
`\componentName[properties]{constraints}`

- **`[properties]`**: Optional key-value pairs defining intrinsic traits of the object (e.g., width, radius, angle, labels). Properties dictate *what* the object is.
- **`{constraints}`**: Optional key-value pairs defining the object's relationship to other objects or spatial positioning (e.g., hanging from a ceiling, resting on an incline, relative alignment). Constraints dictate *where* the object is.

### 1.2 Data Expressions
Values assigned to properties or constraints can take several shapes:
- **Numbers**: Standard numeric values (e.g., `10`, `-0.5`, `1.5e3`).
- **Strings**: Identifiers, normally used for IDs (e.g., `m1`, `p1`).
- **Colors**: Hex codes (e.g., `#ff0000`, `#333`).
- **Math / Text**: LaTeX math mode strings enclosed in dollar signs (e.g., `$m_1$`, `$\theta$`, `$\text{My Text}$`). *Note: To include spaces in text properties, you MUST use math mode strings.*
- **Anchor Expressions**: A reference to a specific point on another component, formatted directly as `id.anchor` (e.g., `m1.top`, `inc1.surface`).
- **Tuple Expressions**: Comma-separated anchors in parentheses (e.g., `(m1.right, p1.center)`).
- **List Expressions**: Arrays of values (e.g., `[length, L]`).
- **Path Expressions**: Multi-node routing paths using arrows and routing methods (e.g., `(m1.right -> over(p1) -> m2.top)`).
- **Object Expressions**: Inline constraint objects used when a constraint requires multiple parameters (e.g., `{anchor=gnd.surface, mu=0.35}`).

---

## 2. Components & Anchors

Every component has a specific set of supported **properties**, **constraints**, and **anchors**. Anchors are reference points that other components can attach to or align with.

### 2.1 Environmental Components

#### `\floor`
An infinite horizontal ground line.
- **Properties**: 
  - `width` (default: 1000)
  - `thickness` (default: 0.5)
- **Constraints**: 
  - `y`: The absolute vertical coordinate of the floor's top surface.
- **Anchors**: 
  - `surface`, `top`: The center of the top edge.

#### `\ceiling`
An infinite horizontal ceiling line.
- **Properties**: 
  - `width` (default: 1000)
  - `thickness` (default: 0.5)
- **Constraints**: 
  - `y`: The absolute vertical coordinate of the ceiling's bottom surface.
- **Anchors**: 
  - `surface`, `bottom`: The center of the bottom edge.

#### `\wall`
A vertical wall.
- **Properties**: 
  - `thickness` (default: 0.5)
  - `height` (default: 1000)
- **Constraints**: 
  - `x`: Absolute horizontal coordinate (left edge).
  - `y`: Absolute vertical coordinate (bottom edge).
  - `bottom=id.anchor`: Rests the bottom of the wall on another surface.
- **Anchors**: 
  - `center`: Dead center of the wall.
  - `left`, `right`: Center-left and center-right edges.
  - `surface`: Synonymous with the right edge.

---

### 2.2 Rigid Objects

#### `\incline`
A wedge or ramp, building a right triangle from a base corner.
- **Properties**: 
  - `angle`: In degrees, starting from 0 (horizontal).
  - `length`: The hypotenuse length.
  - `x`, `y`: Position parameters can be passed in properties as well.
- **Constraints**: 
  - `x`, `y`: Absolute coordinates for the bottom-left base corner.
  - `on=id.anchor`: Rests the bottom of the incline on another surface.
- **Anchors**: 
  - `top`, `peak`, `crest`: The highest point of the wedge.
  - `base`, `bottom`, `origin`: The bottom corner.
  - `center`, `surface`: The exact midpoint of the sloped hypotenuse surface.

#### `\block`
A standard rectangular mass.
- **Properties**: 
  - `width`, `height`: Dimensions.
  - `label_mass`: Text/Math to draw inside the block (e.g., `$m_1$`).
  - `hideProperties`: Array of properties to visually hide (e.g., `[width, height]`).
- **Constraints**:
  - `hang=id.anchor`: Freely suspends the block so its top-center is directly under the anchor point.
  - `on=id.anchor`: Rests the block on a surface. If placed on an incline, the solver rotates the block to match the incline's angle. (e.g. `on={anchor=inc1.surface, mu=0.35}` to specify friction).
  - `align_x=id.anchor`: Horizontally aligns the block's center with the anchor.
  - `below=id.anchor`: Places the block directly below an anchor. Often combined with `distance`.
  - `position=number`: When constrained `on` an incline, this slides the block along the ramp (distance from base).
  - `x=number`, `y=number`: Absolute coordinates for the left/bottom edges.
- **Anchors**: 
  - `center`: Exact center of mass.
  - `surface`, `top`: Top center.
  - `bottom`, `left`, `right`: Corresponding edge centers.

#### `\pulley`
A circular wheel used for routing strings or springs.
- **Properties**: 
  - `radius` (default: 1).
- **Constraints**:
  - `hang=id.anchor`: Suspends the pulley's center exactly at the anchor point.
  - `from=id.anchor`: Attaches the pulley to an anchor via a strut. Requires `distance` and `direction` (angle in degrees).
  - `relative_to=id.anchor`: Makes the `direction` angle relative to the rotation of the referenced object (e.g., perpendicular to an incline).
  - `align_x=id.anchor`: Horizontally aligns the pulley with an anchor.
  - `below=id.anchor`: Places the pulley below an anchor, offset by `distance`.
  - `x=number`, `y=number`: Absolute coordinates for the center.
- **Anchors**: 
  - `center`: Exact middle of the pulley.
  - `surface`, `top`, `bottom`, `left`, `right`: Tangent points on the circumference.

---

### 2.3 Connectors

Connectors establish visual lines, forces, strings, or springs between components. They support dynamic routing that automatically wraps around pulleys.

#### `\string`, `\spring`, `\rod`, `\vector`
- **Properties**: 
  - `length`: Explicit length for unconstrained vectors.
  - `angle`, `direction`: Explicit angle for unconstrained vectors.
  - `align`: Forces alignment (e.g., `align=horizontal`).
  - `color`: Vector color (e.g., `#10b981`).
  - `label`: Vector label (e.g., `$N$`).
  - `hideProperties`: Array of properties to hide (e.g., `[length, L]`).
- **Constraints**:
  - `connects`: The primary constraint defining the path. See *Section 3*.
  - `align`: Horizontal or vertical forced alignment.
  - `direction`: Absolute angle in degrees.
  - `relative_to=id.anchor`: Makes the direction relative to another component's rotation.

---

### 2.4 Logical Components & Annotations

#### `\group`
An invisible container that applies transformations to all members.
- **Properties**: `x`, `y` (offsets).
- **Constraints**: `x`, `y`.
- *Note: Other components can join a group by adding `group=id` to their constraints.*

#### `\label`, `\note`, `\text`
Floating text elements for documentation on the canvas.
- **Properties**: `label` (e.g., `$\text{Find acceleration}$`).
- **Constraints**:
  - `at=id.anchor`, `origin=id.anchor`, `connects=id.anchor`: Attaches the text to an anchor.
  - `dx=number`, `dy=number`: Relative offset from the anchor.
  - `x=number`, `y=number`: Absolute coordinates.

---

## 3. Advanced Routing & Paths

The `connects` constraint is incredibly powerful and handles three distinct topologies:

### 3.1 Single Anchor Vector
Defines a vector originating from an anchor, pointing in a specific direction with a specific length. Useful for force arrows.
```latex
\vector[id=f_gravity, length=3]{connects=m1.center, direction=270}
\vector[id=f_normal, length=2, color=#10b981, label=$N$, hideProperties=[length, L]]{connects=m1.surface, direction=90, relative_to=inc1.surface}
```

### 3.2 Tuple Connection
A straight line connecting two discrete anchors. The solver calculates the necessary length and angle.
```latex
\spring[id=sp1]{connects=(wall1.right, m1.left)}
```

### 3.3 Multi-Node Path Routing
A multi-segment path that can route `over` or `under` intermediate circular objects (like pulleys). The solver calculates the complex tangent entry and exit points automatically.
```latex
\string[id=str1]{connects=(m1.right -> over(p1) -> under(p2) -> m2.top)}
```
- **Syntax**: `( start_anchor -> method(pulley_id) -> end_anchor )`
- **Valid Methods**: 
  - `over`: Routes the string over the top of the pulley.
  - `under`: Routes the string under the bottom of the pulley.
  - `vover`: "Vertical over" - a specialized tangent calculation that ensures the entry/exit points are strictly vertical where possible.

---

## 4. Constraint Solving Logic & Best Practices

The MechTeX solver uses a topological approach to resolve coordinates. It iteratively resolves independent components first, then resolves dependent components.

### 4.1 Dependency Order
A component that relies on another must have its dependencies clearly stated via constraints. Circular dependencies (e.g., `m1` depends on `m2` which depends on `m1`) will cause the solver to throw an "Unresolvable dependencies" error.

### 4.2. **`on` vs `hang`**:
   - Use `on=inc1.surface` to rest a block on an incline. The solver calculates the normal angle automatically, applying rotation to the block and recalculating its bounding box.
     - **Note:** You can pass additional parameters like friction (`mu`) by wrapping the anchor in an object expression: `on={anchor=inc1.surface, mu=0.35}`.
   - Use `hang=ceil1.bottom` to suspend an object. The object remains vertically oriented but tracks the anchor's position.

### 4.3 Compound Alignments
You can combine multiple constraints to achieve precise placements. For example, to place a block below a pulley but aligned horizontally:
```latex
\block[id=m2, width=1.5, height=1.5]{below=p1.bottom, distance=2, align_x=p1.center}
```

### 4.4 Group Offsets
Groups act as a translation matrix. If a group has `x=10, y=5`, all components that specify `group=group_id` will have `+10` and `+5` applied to their final resolved coordinates.
